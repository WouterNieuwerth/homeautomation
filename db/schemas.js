var ThermostatDevice = {
  units: String,
  indoorTemperature: Number,
  outdoorTemperature: Number,
  allowedModes: Array,
  hasDualSetpointStatus: Boolean,
  minHeatSetpoint: Number,
  maxHeatSetpoint: Number,
  minCoolSetpoint: Number,
  maxCoolSetpoint: Number,
  deadband: Number,
  changeableValues: {
    mode: String,
    heatSetpoint: Number,
    coolSetpoint: Number,
    thermostatSetpointStatus: String,
    holdUntil: String,
    nextPeriodTime: String,
    endHeatSetpoint: Number,
    endCoolSetpoint: Number,
    heatCoolMode: String
  },
  operationStatus: {
    mode: String,
    fanRequest: Boolean,
    circulationFanRequest: Boolean
  },
  displayedOutdoorHumidity: Number,
  heatAndCoolDemand: {
    currentStage: Number,
    demand: Number,
    mode: String,
    stagesOn: Array
  },
  vacationHold: {
    enabled: Boolean
  },
  currentSchedulePeriod: {
    day: String,
    period: String
  },
  scheduleCapabilities: {
    availableScheduleTypes: Array,
    schedulableFan: Boolean
  },
  scheduleType: {
    scheduleType: String,
    scheduleSubType: String
  },
  allowedTimeIncrements: Number,
  isAlive: Boolean,
  isUpgrading: Boolean,
  macID: String,
  deviceClass: String,
  deviceType: String,
  deviceID: String,
  name: String,
  isProvisioned: Boolean,
  settings: {
    hardwareSettings: {
      brightness: Number,
      maxBrightness: Number
    },
    temperatureMode: {
      air: Boolean
    },
    specialMode: {}
  },
  deviceSettings: {},
  userDefinedDeviceName: String,
  timestamp: {type: Date, default: Date.now}
}

module.exports = {
  ThermostatDevice: ThermostatDevice
}
