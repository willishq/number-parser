export interface DatabaseEntry {
  code: string
  internationalPrefix: string
  nationalPrefix?: string
}

export class InvalidNumberError extends Error {
  constructor (message: string) {
    super((message.length > 0) ? message : 'The number is invalid')
  }

  static incorrectFormat (): InvalidNumberError {
    return new InvalidNumberError('The number is incorrectly formatted')
  }

  static undefinedCountryPrefix (): InvalidNumberError {
    return new InvalidNumberError('The number does not have a country prefix')
  }
}

export default class Parser {
  database: DatabaseEntry[]
  constructor (database: DatabaseEntry[]) {
    this.database = database
  }

  formatNumber (dialledNumber: string, userNumber: string): string {
    if (!this.testNumberFormat(dialledNumber) || !this.testNumberFormat(userNumber)) {
      throw InvalidNumberError.incorrectFormat()
    }

    const { internationalPrefix, nationalPrefix = '0' } = this.findCountry(userNumber)

    if (dialledNumber.startsWith(nationalPrefix)) {
      return `+${internationalPrefix}` + dialledNumber.slice(nationalPrefix.length)
    }

    this.findCountry(dialledNumber)
    return dialledNumber
  }

  testNumberFormat (number: string): boolean {
    return /^\+?[0-9]+$/.test(number)
  }

  findCountry (number: string): DatabaseEntry {
    if (!number.startsWith('+')) {
      throw InvalidNumberError.incorrectFormat()
    }

    const country = this.database.find(entry => number.startsWith('+' + entry.internationalPrefix))

    if (country === undefined) {
      throw InvalidNumberError.undefinedCountryPrefix()
    }

    return country
  }
}
