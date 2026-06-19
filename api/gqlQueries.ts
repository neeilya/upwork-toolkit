export const myFeedQuery = `
  query($queryParams: UserSavedSearchesParams) {
    userSavedSearches(params: $queryParams) {
      results {
        id
        uid:id
        title
        ciphertext
        description
        type
        recno
        freelancersToHire
        duration
        durationLabel
        engagement
        amount {
          amount:displayValue
        }
        createdOn:createdDateTime
        publishedOn:publishedDateTime
        renewedOn:renewedDateTime
        prefFreelancerLocation
        prefFreelancerLocationMandatory
        connectPrice
        client {
          totalHires
          totalPostedJobs
          totalSpent {
            rawValue
            currency
            displayValue
          }
          paymentVerificationStatus
          location {
            country
          }
          totalReviews
          totalFeedback
          companyRid
          edcUserId
          lastContractRid
          companyOrgUid
          hasFinancialPrivacy
        }
        enterpriseJob
        premium
        jobTs:jobTime
        skills {
          id
          name
          prettyName
          highlighted
        }
        contractorTier
        jobStatus
        relevanceEncoded
        totalApplicants
        proposalsTier
        isLocal:local
        locations {
          city
          country
        }
        isApplied:applied
        attrs {
          id
          uid:id
          prettyName:prefLabel
          parentSkillId
          prefLabel
          highlighted
          freeText
        }
        hourlyBudget {
          type
          min
          max
        }
        clientRelation {
          companyRid
          companyName
          edcUserId
          lastContractPlatform
          lastContractRid
          lastContractTitle
        }
        totalFreelancersToHire
        contractToHire
      }
      paging {
        total
        count
        resultSetTs:resultSetTime
      }
    }
  }
`

export const bestMatchesQuery = `
  query bestMatches {
    bestMatchJobsFeed(limit: 30) {
      results {
        uid:id
        title
        ciphertext
        description
        type
        recno
        freelancersToHire
        duration
        durationLabel
        engagement
        amount {
          amount
          currencyCode
        }
        createdOn:createdDateTime
        publishedOn:publishedDateTime
        renewedOn:renewedDateTime
        prefFreelancerLocation
        prefFreelancerLocationMandatory
        connectPrice
        client {
          totalHires
          totalSpent
          paymentVerificationStatus
          location {
            country
            city
            state
            countryTimezone
            worldRegion
          }
          totalReviews
          totalFeedback
          hasFinancialPrivacy
        }
        enterpriseJob
        premium
        jobTime
        skills {
          id
          prefLabel
        }
        tierText
        tier
        tierLabel
        proposalsTier
        isApplied
        hourlyBudget {
          type
          min
          max
        }
        weeklyBudget {
          amount
        }
        clientRelation {
          companyName
          lastContractRid
          lastContractTitle
        }
        relevanceEncoded
        attrs {
          uid:id
          prettyName
          freeText
          skillType
        }
      }
      paging {
        total
        count
        minTime
        maxTime
      }
    }
  }
`

export const mostRecentQuery = `
  query($limit: Int, $toTime: String) {
    mostRecentJobsFeed(limit: $limit, toTime: $toTime) {
      results {
        id
        uid:id
        title
        ciphertext
        description
        type
        recno
        freelancersToHire
        duration
        engagement
        amount {
          amount
        }
        createdOn:createdDateTime
        publishedOn:publishedDateTime
        prefFreelancerLocationMandatory
        connectPrice
        client {
          totalHires
          totalSpent
          paymentVerificationStatus
          location {
            country
          }
          totalReviews
          totalFeedback
          hasFinancialPrivacy
        }
        tierText
        tier
        tierLabel
        proposalsTier
        enterpriseJob
        premium
        jobTs:jobTime
        attrs:skills {
          id
          uid:id
          prettyName:prefLabel
          prefLabel
        }
        hourlyBudget {
          type
          min
          max
        }
        isApplied
      }
      paging {
        total
        count
        resultSetTs:minTime
        maxTime
      }
    }
  }
`

export const userQuery = `
  query {
    user {
      id
      rid
      nid
    }
  }
`
