import { Gpio } from "pigpio"

const led = new Gpio(17, { mode: Gpio.OUTPUT })

export function onLed() {
  led.digitalWrite(1) // LED 켜기
}

export function offLed() {
  led.digitalWrite(0) // LED 끄기
}

export function readButton() {
  return new Promise((resolve) => {
    const button = new Gpio(27, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP })
    button.on("interrupt", (level) => {
      resolve(level === 0 ? "pressed" : "released")
    })
  })
}
