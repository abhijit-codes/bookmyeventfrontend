import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { logout, setCredentials } from "@/features/auth/authSlice"

const normalizeApiUrl = (url) => {
  const baseUrl = (url || "https://bookmyeventbackend.onrender.com/api/v1").replace(/\/+$/, "")
  return baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`
}

const API_URL = normalizeApiUrl(import.meta.env.PROD ? "/api/v1" : import.meta.env.VITE_API_URL)

const toFormData = (values) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    if (Array.isArray(value)) value.forEach((item) => formData.append(key, item))
    else formData.append(key, value)
  })
  return formData
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken
      if (token) headers.set("authorization", `Bearer ${token}`)
      return headers
    },
  })

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      )

      if (refreshResult.data?.data?.accessToken) {
        api.dispatch(
          setCredentials({
            account: api.getState().auth.account,
            refreshToken,
            accessToken: refreshResult.data.data.accessToken,
          }),
        )
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Auth", "Vendors", "VendorDashboard", "Bookings", "Wallet", "Admin", "Reports", "Notifications", "Settlements", "Favorites"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Auth"],
    }),
    googleLogin: builder.mutation({
      query: (body) => ({ url: "/auth/google", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Auth"],
    }),
    requestUserPasswordOtp: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password/request-otp", method: "POST", body }),
    }),
    verifyUserPasswordOtp: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password/verify-otp", method: "POST", body }),
    }),
    resetUserPassword: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password/reset", method: "POST", body }),
    }),
    requestVendorPasswordOtp: builder.mutation({
      query: (body) => ({ url: "/auth/vendor/forgot-password/request-otp", method: "POST", body }),
    }),
    verifyVendorPasswordOtp: builder.mutation({
      query: (body) => ({ url: "/auth/vendor/forgot-password/verify-otp", method: "POST", body }),
    }),
    resetVendorPassword: builder.mutation({
      query: (body) => ({ url: "/auth/vendor/forgot-password/reset", method: "POST", body }),
    }),
    signupUser: builder.mutation({
      query: (body) => ({ url: "/auth/signup/user", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    signupVendor: builder.mutation({
      query: (body) => ({ url: "/auth/signup/vendor", method: "POST", body: toFormData(body) }),
      transformResponse: (response) => response,
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      transformResponse: (response) => response.data,
      providesTags: ["Auth"],
    }),
    updateMe: builder.mutation({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Auth"],
    }),
    updateMyProfileImage: builder.mutation({
      query: (body) => ({ url: "/auth/me/image", method: "PATCH", body: toFormData(body) }),
      invalidatesTags: ["Auth"],
    }),
    getMyNotifications: builder.query({
      query: () => "/auth/me/notifications",
      transformResponse: (response) => response.data,
      providesTags: ["Notifications"],
    }),
    sendUserSupportMessage: builder.mutation({
      query: (body) => ({ url: "/auth/me/support-message", method: "POST", body }),
    }),
    getMyFavorites: builder.query({
      query: () => "/favorites",
      transformResponse: (response) => response.data,
      providesTags: ["Favorites"],
    }),
    addMyFavorite: builder.mutation({
      query: (vendorId) => ({ url: `/favorites/${vendorId}`, method: "POST" }),
      invalidatesTags: ["Favorites"],
    }),
    removeMyFavorite: builder.mutation({
      query: (vendorId) => ({ url: `/favorites/${vendorId}`, method: "DELETE" }),
      invalidatesTags: ["Favorites"],
    }),
    getVendors: builder.query({
      query: (params = {}) => ({ url: "/vendors", params }),
      transformResponse: (response) => response.data,
      providesTags: ["Vendors"],
    }),
    getVendor: builder.query({
      query: (id) => `/vendors/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Vendors", id }],
    }),
    getVendorDashboard: builder.query({
      query: () => "/vendors/dashboard",
      transformResponse: (response) => response.data,
      providesTags: ["VendorDashboard"],
    }),
    addVendorService: builder.mutation({
      query: (body) => ({ url: "/vendors/services", method: "POST", body: toFormData(body) }),
      invalidatesTags: ["VendorDashboard", "Vendors"],
    }),
    updateVendorService: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/vendors/services/${id}`, method: "PATCH", body: toFormData(body) }),
      invalidatesTags: ["VendorDashboard", "Vendors"],
    }),
    deleteVendorService: builder.mutation({
      query: (id) => ({ url: `/vendors/services/${id}`, method: "DELETE" }),
      invalidatesTags: ["VendorDashboard", "Vendors"],
    }),
    updateVendorProfile: builder.mutation({
      query: (body) => ({ url: "/vendors/profile", method: "PATCH", body }),
      invalidatesTags: ["VendorDashboard", "Auth"],
    }),
    updateVendorProfileImage: builder.mutation({
      query: (body) => ({ url: "/vendors/profile/image", method: "PATCH", body: toFormData(body) }),
      invalidatesTags: ["VendorDashboard", "Auth", "Vendors"],
    }),
    addBankAccount: builder.mutation({
      query: (body) => ({ url: "/vendors/bank-accounts", method: "POST", body }),
      invalidatesTags: ["VendorDashboard", "Wallet"],
    }),
    updateBankAccount: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/vendors/bank-accounts/${id}`, method: "PUT", body }),
      invalidatesTags: ["VendorDashboard", "Wallet"],
    }),
    sendVendorSupportMessage: builder.mutation({
      query: (body) => ({ url: "/vendors/support-message", method: "POST", body }),
    }),
    getVendorBookings: builder.query({
      query: () => "/vendors/dashboard/bookings",
      transformResponse: (response) => response.data,
      providesTags: ["Bookings"],
    }),
    confirmBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/vendor-confirm`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard"],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/vendor-cancel`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard"],
    }),
    cancelMyBooking: builder.mutation({
      query: ({ id, reason }) => ({ url: `/bookings/${id}/user-cancel`, method: "PATCH", body: { reason } }),
      invalidatesTags: ["Bookings"],
    }),
    completeBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/complete`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard", "Wallet"],
    }),
    getMyBookings: builder.query({
      query: () => "/bookings/mine",
      transformResponse: (response) => response.data,
      providesTags: ["Bookings"],
    }),
    createAdvanceOrder: builder.mutation({
      query: (body) => ({ url: "/bookings/advance-order", method: "POST", body }),
    }),
    verifyAdvancePayment: builder.mutation({
      query: ({ serviceId, ...body }) => ({ url: `/bookings/${serviceId}/verify-advance`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    createRemainingOrder: builder.mutation({
      query: (bookingId) => ({ url: `/bookings/${bookingId}/remaining-order`, method: "POST" }),
    }),
    verifyRemainingPayment: builder.mutation({
      query: ({ bookingId, ...body }) => ({ url: `/bookings/${bookingId}/verify-remaining`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    getWallet: builder.query({
      query: () => "/wallet",
      transformResponse: (response) => response.data,
      providesTags: ["Wallet"],
    }),
    requestWithdrawal: builder.mutation({
      query: (body) => ({ url: "/wallet/withdraw", method: "POST", body }),
      invalidatesTags: ["Wallet", "VendorDashboard"],
    }),
    getAdminVendors: builder.query({
      query: (params = {}) => ({ url: "/admin/vendors", params }),
      transformResponse: (response) => response.data,
      providesTags: ["Vendors"],
    }),
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      transformResponse: (response) => response.data,
      providesTags: ["Admin"],
    }),
    updateCommissionSettings: builder.mutation({
      query: (body) => ({ url: "/admin/commission-settings", method: "PATCH", body }),
      invalidatesTags: ["Admin", "Vendors"],
    }),
    getAdminUsers: builder.query({
      query: (params = {}) => ({ url: "/admin/users", params }),
      transformResponse: (response) => response.data,
      providesTags: ["Admin"],
    }),
    getAdminVendor: builder.query({
      query: (id) => `/admin/vendors/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Vendors", id }],
    }),
    getAdminBookings: builder.query({
      query: () => "/admin/bookings",
      transformResponse: (response) => response.data,
      providesTags: ["Bookings"],
    }),
    getAdminTransactions: builder.query({
      query: () => "/admin/transactions",
      transformResponse: (response) => response.data,
      providesTags: ["Admin"],
    }),
    getAdminSettlements: builder.query({
      query: () => "/admin/settlements",
      transformResponse: (response) => response.data,
      providesTags: ["Settlements"],
    }),
    completeAdminWithdrawal: builder.mutation({
      query: ({ id, referenceNumber }) => ({ url: `/admin/withdrawals/${id}/complete`, method: "PATCH", body: { referenceNumber } }),
      invalidatesTags: ["Settlements", "Admin", "Wallet"],
    }),
    getAdminAnalytics: builder.query({
      query: () => "/admin/analytics",
      transformResponse: (response) => response.data,
      providesTags: ["Admin"],
    }),
    getAdminReports: builder.query({
      query: (params = {}) => ({ url: "/admin/reports", params }),
      transformResponse: (response) => response.data,
      providesTags: ["Reports"],
    }),
    replyAdminReport: builder.mutation({
      query: ({ id, reply }) => ({ url: `/admin/reports/${id}/reply`, method: "PATCH", body: { reply } }),
      invalidatesTags: ["Reports"],
    }),
    getAdminModeration: builder.query({
      query: () => "/admin/moderation",
      transformResponse: (response) => response.data,
      providesTags: ["Admin", "Vendors", "Reports"],
    }),
    getAdminNotifications: builder.query({
      query: () => "/admin/notifications",
      transformResponse: (response) => response.data,
      providesTags: ["Notifications"],
    }),
    createAdminNotification: builder.mutation({
      query: (body) => ({ url: "/admin/notifications", method: "POST", body }),
      invalidatesTags: ["Notifications"],
    }),
    approveVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Vendors", "Admin"],
    }),
    rejectVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/reject`, method: "PATCH" }),
      invalidatesTags: ["Vendors", "Admin"],
    }),
    suspendVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/suspend`, method: "PATCH" }),
      invalidatesTags: ["Vendors", "Admin"],
    }),
  }),
})

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useRequestUserPasswordOtpMutation,
  useVerifyUserPasswordOtpMutation,
  useResetUserPasswordMutation,
  useRequestVendorPasswordOtpMutation,
  useVerifyVendorPasswordOtpMutation,
  useResetVendorPasswordMutation,
  useSignupUserMutation,
  useSignupVendorMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyProfileImageMutation,
  useGetMyNotificationsQuery,
  useSendUserSupportMessageMutation,
  useGetMyFavoritesQuery,
  useAddMyFavoriteMutation,
  useRemoveMyFavoriteMutation,
  useGetVendorsQuery,
  useGetVendorQuery,
  useGetVendorDashboardQuery,
  useAddVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useUpdateVendorProfileMutation,
  useUpdateVendorProfileImageMutation,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
  useSendVendorSupportMessageMutation,
  useGetVendorBookingsQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useCancelMyBookingMutation,
  useCompleteBookingMutation,
  useGetMyBookingsQuery,
  useCreateAdvanceOrderMutation,
  useVerifyAdvancePaymentMutation,
  useCreateRemainingOrderMutation,
  useVerifyRemainingPaymentMutation,
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useGetAdminVendorsQuery,
  useGetAdminDashboardQuery,
  useUpdateCommissionSettingsMutation,
  useGetAdminUsersQuery,
  useGetAdminVendorQuery,
  useGetAdminBookingsQuery,
  useGetAdminTransactionsQuery,
  useGetAdminSettlementsQuery,
  useCompleteAdminWithdrawalMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminReportsQuery,
  useReplyAdminReportMutation,
  useGetAdminModerationQuery,
  useGetAdminNotificationsQuery,
  useCreateAdminNotificationMutation,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
} = apiSlice
