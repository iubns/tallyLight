// app.ts

import express from "express"
import { onLed, offLed, readButton } from "./util/gpio"

const app = express()

app.set("port", process.env.PORT || 3000)

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.post("/on-light", (req, res) => {
  onLed()
  console.log("Light ON")
  res.send("Light ON")
})

app.post("/off-light", (req, res) => {
  offLed()
  console.log("Light OFF")
  res.send("Light OFF")
})

app.get("/read-button", async (req, res) => {
  try {
    const buttonState = await readButton()
    console.log("Button state:", buttonState)
    res.send(`Button is ${buttonState}`)
  } catch (error) {
    console.error("Error reading button:", error)
    res.status(500).send("Error reading button")
  }
})

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번에서 대기중")
})
