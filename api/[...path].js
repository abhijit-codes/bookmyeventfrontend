const BACKEND_ORIGIN = "https://bookmyeventbackend.onrender.com"

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || ""
  const queryIndex = req.url.indexOf("?")
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : ""
  const targetUrl = `${BACKEND_ORIGIN}/api/${path}${query}`
  const headers = { ...req.headers }

  delete headers.host
  delete headers.connection
  delete headers["content-length"]

  try {
    const hasBody = !["GET", "HEAD"].includes(req.method)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? await readBody(req) : undefined,
    })

    res.status(response.status)
    response.headers.forEach((value, key) => {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })

    const body = Buffer.from(await response.arrayBuffer())
    res.send(body)
  } catch (error) {
    res.status(502).json({ success: false, message: "Unable to reach backend API", error: error.message })
  }
}
