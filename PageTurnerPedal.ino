int button = 7;

unsigned long lastTimeButtonChanged = millis();
unsigned long buttonDebounce = 50;
byte previousButtonState;

int timesPressed = 0;

void setup() {
Serial.begin(9600);
pinMode(button, INPUT);
previousButtonState = digitalRead(button);
}

void loop() {

  unsigned long timeNow = millis();
if (timeNow-lastTimeButtonChanged >= buttonDebounce) {
  byte buttonState = digitalRead(button);
  if (buttonState != previousButtonState) {
    lastTimeButtonChanged = timeNow;
    previousButtonState = buttonState;
    if(buttonState == HIGH) {
      timesPressed ++;
      Serial.print("N");
    }
  }
}
}