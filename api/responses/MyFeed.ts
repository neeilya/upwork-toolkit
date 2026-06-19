// To parse this data:
//
//   import { Convert, MyFeed } from "./file";
//
//   const myFeed = Convert.toMyFeed(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MyFeed {
  data: Data
}

export interface Data {
  userSavedSearches: UserSavedSearches
}

export interface UserSavedSearches {
  paging: Paging
  results: Result[]
}

export interface Paging {
  count: number
  resultSetTs: string
  total: number
}

export interface Result {
  amount: Amount
  attrs: Attr[]
  ciphertext: string
  client: Client
  clientRelation: null
  connectPrice: number
  contractorTier: ContractorTier
  contractToHire: null
  createdOn: string
  description: string
  duration: Duration
  durationLabel: DurationLabel
  engagement: null | string
  enterpriseJob: boolean
  freelancersToHire: number
  hourlyBudget: HourlyBudget
  id: string
  isApplied: boolean
  isLocal: boolean
  jobStatus: JobStatus
  jobTs: string
  locations: null
  prefFreelancerLocation: string[] | null
  prefFreelancerLocationMandatory: boolean
  premium: boolean
  proposalsTier: ProposalsTier
  publishedOn: string
  recno: string
  relevanceEncoded: string
  renewedOn: null
  skills: Skill[]
  title: string
  totalApplicants: number
  totalFreelancersToHire: null
  type: Type
  uid: string
}

export interface Amount {
  amount: string
}

export interface Attr {
  freeText: null
  highlighted: boolean
  id: string
  parentSkillId: null
  prefLabel: string
  prettyName: string
  uid: string
}

export interface Client {
  companyOrgUid: null
  companyRid: string
  edcUserId: string
  hasFinancialPrivacy: boolean
  lastContractRid: string
  location: Location
  paymentVerificationStatus: number | null
  totalFeedback: number
  totalHires: number
  totalPostedJobs: number
  totalReviews: number
  totalSpent: TotalSpent | null
}

export interface Location {
  country: string
}

export interface TotalSpent {
  currency: string
  displayValue: string
  rawValue: string
}

export enum ContractorTier {
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE',
}

export enum Duration {
  Month = 'MONTH',
  Ongoing = 'ONGOING',
  Week = 'WEEK',
}

export enum DurationLabel {
  LessThan1Month = 'Less than 1 month',
  MoreThan6Months = 'More than 6 months',
  The1To3Months = '1 to 3 months',
}

export interface HourlyBudget {
  max: number
  min: number
  type: null | string
}

export enum JobStatus {
  Open = 'Open',
}

export enum ProposalsTier {
  LessThan5 = 'Less than 5',
  The5To10 = '5 to 10',
}

export interface Skill {
  highlighted: boolean
  id: null
  name: string
  prettyName: string
}

export enum Type {
  Fixed = 'FIXED',
  Hourly = 'HOURLY',
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toMyFeed(json: string): MyFeed {
    return cast(JSON.parse(json), r('MyFeed'))
  }

  public static myFeedToJson(value: MyFeed): string {
    return JSON.stringify(uncast(value, r('MyFeed')), null, 2)
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
  MyFeed: o([{ json: 'data', js: 'data', typ: r('Data') }], false),
  Data: o(
    [
      {
        json: 'userSavedSearches',
        js: 'userSavedSearches',
        typ: r('UserSavedSearches'),
      },
    ],
    false
  ),
  UserSavedSearches: o(
    [
      { json: 'paging', js: 'paging', typ: r('Paging') },
      { json: 'results', js: 'results', typ: a(r('Result')) },
    ],
    false
  ),
  Paging: o(
    [
      { json: 'count', js: 'count', typ: 0 },
      { json: 'resultSetTs', js: 'resultSetTs', typ: '' },
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
      {
        json: 'contractorTier',
        js: 'contractorTier',
        typ: r('ContractorTier'),
      },
      { json: 'contractToHire', js: 'contractToHire', typ: null },
      { json: 'createdOn', js: 'createdOn', typ: '' },
      { json: 'description', js: 'description', typ: '' },
      { json: 'duration', js: 'duration', typ: r('Duration') },
      { json: 'durationLabel', js: 'durationLabel', typ: r('DurationLabel') },
      { json: 'engagement', js: 'engagement', typ: u(null, '') },
      { json: 'enterpriseJob', js: 'enterpriseJob', typ: true },
      { json: 'freelancersToHire', js: 'freelancersToHire', typ: 0 },
      { json: 'hourlyBudget', js: 'hourlyBudget', typ: r('HourlyBudget') },
      { json: 'id', js: 'id', typ: '' },
      { json: 'isApplied', js: 'isApplied', typ: true },
      { json: 'isLocal', js: 'isLocal', typ: true },
      { json: 'jobStatus', js: 'jobStatus', typ: r('JobStatus') },
      { json: 'jobTs', js: 'jobTs', typ: '' },
      { json: 'locations', js: 'locations', typ: null },
      {
        json: 'prefFreelancerLocation',
        js: 'prefFreelancerLocation',
        typ: u(a(''), null),
      },
      {
        json: 'prefFreelancerLocationMandatory',
        js: 'prefFreelancerLocationMandatory',
        typ: true,
      },
      { json: 'premium', js: 'premium', typ: true },
      { json: 'proposalsTier', js: 'proposalsTier', typ: r('ProposalsTier') },
      { json: 'publishedOn', js: 'publishedOn', typ: '' },
      { json: 'recno', js: 'recno', typ: '' },
      { json: 'relevanceEncoded', js: 'relevanceEncoded', typ: '' },
      { json: 'renewedOn', js: 'renewedOn', typ: null },
      { json: 'skills', js: 'skills', typ: a(r('Skill')) },
      { json: 'title', js: 'title', typ: '' },
      { json: 'totalApplicants', js: 'totalApplicants', typ: 0 },
      {
        json: 'totalFreelancersToHire',
        js: 'totalFreelancersToHire',
        typ: null,
      },
      { json: 'type', js: 'type', typ: r('Type') },
      { json: 'uid', js: 'uid', typ: '' },
    ],
    false
  ),
  Amount: o([{ json: 'amount', js: 'amount', typ: '' }], false),
  Attr: o(
    [
      { json: 'freeText', js: 'freeText', typ: null },
      { json: 'highlighted', js: 'highlighted', typ: true },
      { json: 'id', js: 'id', typ: '' },
      { json: 'parentSkillId', js: 'parentSkillId', typ: null },
      { json: 'prefLabel', js: 'prefLabel', typ: '' },
      { json: 'prettyName', js: 'prettyName', typ: '' },
      { json: 'uid', js: 'uid', typ: '' },
    ],
    false
  ),
  Client: o(
    [
      { json: 'companyOrgUid', js: 'companyOrgUid', typ: null },
      { json: 'companyRid', js: 'companyRid', typ: '' },
      { json: 'edcUserId', js: 'edcUserId', typ: '' },
      { json: 'hasFinancialPrivacy', js: 'hasFinancialPrivacy', typ: true },
      { json: 'lastContractRid', js: 'lastContractRid', typ: '' },
      { json: 'location', js: 'location', typ: r('Location') },
      {
        json: 'paymentVerificationStatus',
        js: 'paymentVerificationStatus',
        typ: u(0, null),
      },
      { json: 'totalFeedback', js: 'totalFeedback', typ: 3.14 },
      { json: 'totalHires', js: 'totalHires', typ: 0 },
      { json: 'totalPostedJobs', js: 'totalPostedJobs', typ: 0 },
      { json: 'totalReviews', js: 'totalReviews', typ: 0 },
      { json: 'totalSpent', js: 'totalSpent', typ: u(r('TotalSpent'), null) },
    ],
    false
  ),
  Location: o([{ json: 'country', js: 'country', typ: '' }], false),
  TotalSpent: o(
    [
      { json: 'currency', js: 'currency', typ: '' },
      { json: 'displayValue', js: 'displayValue', typ: '' },
      { json: 'rawValue', js: 'rawValue', typ: '' },
    ],
    false
  ),
  HourlyBudget: o(
    [
      { json: 'max', js: 'max', typ: 3.14 },
      { json: 'min', js: 'min', typ: 3.14 },
      { json: 'type', js: 'type', typ: u(null, '') },
    ],
    false
  ),
  Skill: o(
    [
      { json: 'highlighted', js: 'highlighted', typ: true },
      { json: 'id', js: 'id', typ: null },
      { json: 'name', js: 'name', typ: '' },
      { json: 'prettyName', js: 'prettyName', typ: '' },
    ],
    false
  ),
  ContractorTier: ['EXPERT', 'INTERMEDIATE'],
  Duration: ['MONTH', 'ONGOING', 'WEEK'],
  DurationLabel: ['Less than 1 month', 'More than 6 months', '1 to 3 months'],
  JobStatus: ['Open'],
  ProposalsTier: ['Less than 5', '5 to 10'],
  Type: ['FIXED', 'HOURLY'],
}
