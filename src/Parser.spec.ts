import Parser, { DatabaseEntry, InvalidNumberError } from './Parser'

const database: DatabaseEntry[] = [
  { code: 'HK', internationalPrefix: '852' },
  { code: 'JP', internationalPrefix: '81' },
  { code: 'NZ', internationalPrefix: '64' },
  { code: 'UK', internationalPrefix: '44' },
  { code: 'US', internationalPrefix: '1', nationalPrefix: '1' }
]

describe('Parser#testNumberFormat', () => {
  let parser: Parser
  beforeAll(() => {
    parser = new Parser(database)
  })

  it('should return true for a valid number', () => {
    expect(parser.testNumberFormat('+85212345678')).toBe(true)
  })

  it('should return false for an invalid number', () => {
    expect(parser.testNumberFormat('+85+212345678')).toBe(false)
    expect(parser.testNumberFormat('85+212345678')).toBe(false)
    expect(parser.testNumberFormat('+85a103940')).toBe(false)
  })
})

describe('Parser#findCountry', () => {
  let parser: Parser
  beforeAll(() => {
    parser = new Parser(database)
  })

  it('should throw an incorrect format error if the number is incorrectly formatted', () => {
    expect(() => parser.findCountry('123')).toThrow(InvalidNumberError.incorrectFormat())
  })

  it('should throw an undefind number prefix error if the international number prefix is not in the database', () => {
    expect(() => parser.findCountry('+993')).toThrow(InvalidNumberError.undefinedCountryPrefix())
  })

  it('should return the country for the country code', () => {
    expect(parser.findCountry('+85212345678')).toEqual(database[0])
  })
})

describe('Parser#formatNumber', function () {
  let parser: Parser
  beforeAll(() => {
    parser = new Parser(database)
  })

  it('should format a national number correctly', () => {
    expect(parser.formatNumber('012345678', '+85212876543')).toEqual('+85212345678')
    expect(parser.formatNumber('112345678', '+1212876543')).toEqual('+112345678')
  })

  it('should format an international number correctly', () => {
    expect(parser.formatNumber('+85212345678', '+44212876543')).toEqual('+85212345678')
  })

  test('should not allow international numbers that are not in the database', () => {
    expect(() => parser.formatNumber('07456111234', '+567456111234')).toThrow(InvalidNumberError.undefinedCountryPrefix())
    expect(() => parser.formatNumber('+567456111234', '+447456111234')).toThrow(InvalidNumberError.undefinedCountryPrefix())
  })

  it('should not allow numbers with no national or international prefix', () => {
    expect(() => parser.formatNumber('7774123456', '+447700900123')).toThrow(InvalidNumberError.incorrectFormat())
  })

  it('should not allow dialled numbers to not have the international code', () => {
    expect(() => parser.formatNumber('03215552368', '013115554321')).toThrow(InvalidNumberError.incorrectFormat())
  })

  it('should not allow numbers with invalid characters', () => {
    expect(() => parser.formatNumber('+44+215552368', '+4413115554321')).toThrow(InvalidNumberError.incorrectFormat())
    expect(() => parser.formatNumber('+44215552368', '+44+4413115554321')).toThrow(InvalidNumberError.incorrectFormat())
    expect(() => parser.formatNumber('04?215552368', '+4413115554321')).toThrow(InvalidNumberError.incorrectFormat())
    expect(() => parser.formatNumber('+44215552368', '+44z13115554321')).toThrow(InvalidNumberError.incorrectFormat())
  })
})
