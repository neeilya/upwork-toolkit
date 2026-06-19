import Job from './Job'
import { List } from '@mui/material'
import { Job as UpworkJob } from '@/api/upwork'
import { createElement, Fragment } from 'react'

type Props = {
  detailed: boolean
  unseenIds: string[]
  jobs: UpworkJob[]
  onJobClick: (job: UpworkJob) => void
}

const JobList = (props: Props) =>
  createElement(
    props.detailed ? Fragment : List,
    {
      ...(!props.detailed && { disablePadding: true }),
    },
    props.jobs.map((job) => (
      <Job
        job={job}
        key={job.ciphertext}
        detailed={props.detailed}
        onJobClick={props.onJobClick}
        unseen={props.unseenIds.includes(job.ciphertext)}
      />
    ))
  )

export default JobList
