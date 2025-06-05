// app.ts

import express from "express"
import { screenState, setRVM, toggleScreen } from "./util/gpio"

const app = express()

app.set("port", process.env.PORT || 3000)

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/screen-state", (req, res) => {
  const state = screenState()
  res.json(state)
})

app.post("/switch-screen", (req, res) => {
  toggleScreen()
  res.send("Screen switched")
})

app.post("/push-button", async (req, res) => {
  setRVM(req.body.screenId as string)
  res.send(`Button for screen ${req.query.screenId} pushed`)
})

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번에서 대기중")
})
