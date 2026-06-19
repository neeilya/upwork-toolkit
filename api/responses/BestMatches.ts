// To parse this data:
//
//   import { Convert, BestMatches } from "./file";
//
//   const bestMatches = Convert.toBestMatches(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface BestMatches {
  data: Data
}

export interface Data {
  bestMatchJobsFeed: BestMatchJobsFeed
}

export interface BestMatchJobsFeed {
  paging: Paging
  results: Result[]
}

export interface Paging {
  count: number
  maxTime: string
  minTime: string
  total: number
}

export interface Result {
  amount: Amount
  attrs: Attr[]
  ciphertext: string
  client: Client
  clientRelation: null
  connectPrice: number
  createdOn: Date
  description: string
  duration: Duration | null
  durationLabel: Duration | null
  engagement: Engagement | null
  enterpriseJob: boolean
  freelancersToHire: number
  hourlyBudget: HourlyBudget
  isApplied: boolean
  jobTime: string
  prefFreelancerLocation: null
  prefFreelancerLocationMandatory: boolean
  premium: boolean
  proposalsTier: null | string
  publishedOn: Date
  recno: string
  relevanceEncoded: string
  renewedOn: Date | null
  skills: Skill[]
  tier: Tier
  tierLabel: TierLabel
  tierText: Tier
  title: string
  type: number
  uid: string
  weeklyBudget: WeeklyBudget
}

export interface Amount {
  amount: number
  currencyCode: CurrencyCode
}

export enum CurrencyCode {
  Usd = 'USD',
}

export interface Attr {
  freeText: null | string
  prettyName: null | string
  skillType: number | null
  uid: string
}

export interface Client {
  hasFinancialPrivacy: boolean
  location: Location
  paymentVerificationStatus: number
  totalFeedback: number
  totalHires: number
  totalReviews: number
  totalSpent: number
}

export interface Location {
  city: null | string
  country: string
  countryTimezone: string
  state: null | string
  worldRegion: WorldRegion
}

export enum WorldRegion {
  Americas = 'Americas',
  Asia = 'Asia',
  Europe = 'Europe',
  Oceania = 'Oceania',
}

export enum Duration {
  LessThan1Month = 'Less than 1 month',
  MoreThan6Months = 'More than 6 months',
  The1To3Months = '1 to 3 months',
  The3To6Months = '3 to 6 months',
}

export enum Engagement {
  LessThan30HrsWeek = 'Less than 30 hrs/week',
  The30HrsWeek = '30+ hrs/week',
}

export interface HourlyBudget {
  max: number
  min: number
  type: Type | null
}

export enum Type {
  Default = 'Default',
  Manual = 'Manual',
  NotProvided = 'NotProvided',
}

export interface Skill {
  id: string
  prefLabel: null | string
}

export enum Tier {
  EntryLevel = 'Entry level',
  Expert = 'Expert',
  Intermediate = 'Intermediate',
}

export enum TierLabel {
  ExperienceLevel = 'Experience Level',
}

export interface WeeklyBudget {
  amount: number
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toBestMatches(json: string): BestMatches {
    return cast(JSON.parse(json), r('BestMatches'))
  }

  public static bestMatchesToJson(value: BestMatches): string {
    return JSON.stringify(uncast(value, r('BestMatches')), null, 2)
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ)
  const parentText = parent ? ` on ${parent}` : ''
  const keyText = key ? ` for key "${key}"` : ''
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  )
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a)
        })
        .join(', ')}]`
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal
  } else {
    return typeof typ
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = '',
  parent: any = ''
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key, parent)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(
      cases.map((a) => {
        return l(a)
      }),
      val,
      key,
      parent
    )
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent)
    }
    return d
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined
      result[prop.key] = transform(v, prop.typ, getProps, key, ref)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val, key, parent)
  }
  if (typ === false) return invalidValue(typ, val, key, parent)
  let ref: any = undefined
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
  return { literal: typ }
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function m(additional: any) {
  return { props: [], additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  BestMatches: o([{ json: 'data', js: 'data', typ: r('Data') }], false),
  Data: o(
    [
      {
        json: 'bestMatchJobsFeed',
        js: 'bestMatchJobsFeed',
        typ: r('BestMatchJobsFeed'),
      },
    ],
    false
  ),
  BestMatchJobsFeed: o(
    [
      { json: 'paging', js: 'paging', typ: r('Paging') },
      { json: 'results', js: 'results', typ: a(r('Result')) },
    ],
    false
  ),
  Paging: o(
    [
      { json: 'count', js: 'count', typ: 0 },
      { json: 'maxTime', js: 'maxTime', typ: '' },
      { json: 'minTime', js: 'minTime', typ: '' },
      { json: 'total', js: 'total', typ: 0 },
    ],
    false
  ),
  Result: o(
    [
      { json: 'amount', js: 'amount', typ: r('Amount') },
      { json: 'attrs', js: 'attrs', typ: a(r('Attr')) },
      { json: 'ciphertext', js: 'ciphertext', typ: '' },
      { json: 'client', js: 'client', typ: r('Client') },
      { json: 'clientRelation', js: 'clientRelation', typ: null },
      { json: 'connectPrice', js: 'connectPrice', typ: 0 },
      { json: 'createdOn', js: 'createdOn', typ: Date },
      { json: 'description', js: 'description', typ: '' },
      { json: 'duration', js: 'duration', typ: u(r('Duration'), null) },
      {
        json: 'durationLabel',
        js: 'durationLabel',
        typ: u(r('Duration'), null),
      },
      { json: 'engagement', js: 'engagement', typ: u(r('Engagement'), null) },
      { json: 'enterpriseJob', js: 'enterpriseJob', typ: true },
      { json: 'freelancersToHire', js: 'freelancersToHire', typ: 0 },
      { json: 'hourlyBudget', js: 'hourlyBudget', typ: r('HourlyBudget') },
      { json: 'isApplied', js: 'isApplied', typ: true },
      { json: 'jobTime', js: 'jobTime', typ: '' },
      {
        json: 'prefFreelancerLocation',
        js: 'prefFreelancerLocation',
        typ: null,
      },
      {
        json: 'prefFreelancerLocationMandatory',
        js: 'prefFreelancerLocationMandatory',
        typ: true,
      },
      { json: 'premium', js: 'premium', typ: true },
      { json: 'proposalsTier', js: 'proposalsTier', typ: u(null, '') },
      { json: 'publishedOn', js: 'publishedOn', typ: Date },
      { json: 'recno', js: 'recno', typ: '' },
      { json: 'relevanceEncoded', js: 'relevanceEncoded', typ: '' },
      { json: 'renewedOn', js: 'renewedOn', typ: u(Date, null) },
      { json: 'skills', js: 'skills', typ: a(r('Skill')) },
      { json: 'tier', js: 'tier', typ: r('Tier') },
      { json: 'tierLabel', js: 'tierLabel', typ: r('TierLabel') },
      { json: 'tierText', js: 'tierText', typ: r('Tier') },
      { json: 'title', js: 'title', typ: '' },
      { json: 'type', js: 'type', typ: 0 },
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'weeklyBudget', js: 'weeklyBudget', typ: r('WeeklyBudget') },
    ],
    false
  ),
  Amount: o(
    [
      { json: 'amount', js: 'amount', typ: 3.14 },
      { json: 'currencyCode', js: 'currencyCode', typ: r('CurrencyCode') },
    ],
    false
  ),
  Attr: o(
    [
      { json: 'freeText', js: 'freeText', typ: u(null, '') },
      { json: 'prettyName', js: 'prettyName', typ: u(null, '') },
      { json: 'skillType', js: 'skillType', typ: u(0, null) },
      { json: 'uid', js: 'uid', typ: '' },
    ],
    false
  ),
  Client: o(
    [
      { json: 'hasFinancialPrivacy', js: 'hasFinancialPrivacy', typ: true },
      { json: 'location', js: 'location', typ: r('Location') },
      {
        json: 'paymentVerificationStatus',
        js: 'paymentVerificationStatus',
        typ: 0,
      },
      { json: 'totalFeedback', js: 'totalFeedback', typ: 3.14 },
      { json: 'totalHires', js: 'totalHires', typ: 0 },
      { json: 'totalReviews', js: 'totalReviews', typ: 0 },
      { json: 'totalSpent', js: 'totalSpent', typ: 3.14 },
    ],
    false
  ),
  Location: o(
    [
      { json: 'city', js: 'city', typ: u(null, '') },
      { json: 'country', js: 'country', typ: '' },
      { json: 'countryTimezone', js: 'countryTimezone', typ: '' },
      { json: 'state', js: 'state', typ: u(null, '') },
      { json: 'worldRegion', js: 'worldRegion', typ: r('WorldRegion') },
    ],
    false
  ),
  HourlyBudget: o(
    [
      { json: 'max', js: 'max', typ: 3.14 },
      { json: 'min', js: 'min', typ: 3.14 },
      { json: 'type', js: 'type', typ: u(r('Type'), null) },
    ],
    false
  ),
  Skill: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'prefLabel', js: 'prefLabel', typ: u(null, '') },
    ],
    false
  ),
  WeeklyBudget: o([{ json: 'amount', js: 'amount', typ: 3.14 }], false),
  CurrencyCode: ['USD'],
  WorldRegion: ['Americas', 'Asia', 'Europe', 'Oceania'],
  Duration: [
    'Less than 1 month',
    'More than 6 months',
    '1 to 3 months',
    '3 to 6 months',
  ],
  Engagement: ['Less than 30 hrs/week', '30+ hrs/week'],
  Type: ['Default', 'Manual', 'NotProvided'],
  Tier: ['Entry level', 'Expert', 'Intermediate'],
  TierLabel: ['Experience Level'],
}
