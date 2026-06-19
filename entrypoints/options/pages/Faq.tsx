import { browser } from '#imports'
import upworkApi from '@/api/upwork'
import OpenNewPageIcon from '@/components/OpenNewPageIcon'
import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
} from '@mui/material'
import { ReactNode } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { PublicPath } from 'wxt/browser'

const supportEmail = 'support@uptoolkit.io'

type Section = {
  title: string
  body: ReactNode
}

const sections: Section[] = [
  {
    title: 'How do I customize my jobs feed?',
    body: (
      <>
        <Typography variant="h6">Feed sources/channels</Typography>
        Upwork provides three channels/feeds to deliver jobs to you:
        <Box component="ul" sx={{ '& li:not(:last-child)': { mb: 2 } }}>
          {Object.entries(upworkApi.feedOptions).map(([feedType, value]) => (
            <li key={feedType}>
              <Link
                target="_blank"
                href={value.pageUrl}
                rel="noopener noreferrer"
              >
                <Box component="strong">
                  {feedType} <OpenNewPageIcon />
                </Box>
              </Link>{' '}
              -{' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: [
                    value.description.charAt(0).toUpperCase(),
                    value.description.slice(1),
                  ].join(''),
                }}
              />
            </li>
          ))}
        </Box>
        You can choose any channel to subscribe to in{' '}
        <Link component={RouterLink} to="/settings?feedSelectOpen=true">
          settings
        </Link>
        .
        <Typography variant="h6" sx={{ mt: 3 }}>
          Using custom filters
        </Typography>
        <ol>
          <li>
            Select "My Feed" in{' '}
            <Link component={RouterLink} to="/settings?feedSelectOpen=true">
              settings
            </Link>
          </li>
          <li>
            Go to Upwork{' '}
            <Link target="_blank" href="https://www.upwork.com/nx/jobs/search">
              <strong>
                search page <OpenNewPageIcon />
              </strong>
            </Link>
          </li>
          <li>Create new search with desired filters and save it</li>
          <li>Wait for the extension to load new batch of jobs</li>
        </ol>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Removing existing filters
        </Typography>
        <ol>
          <li>
            Open{' '}
            <Link target="_blank" href="https://www.upwork.com/nx/find-work/">
              "Find work" page <OpenNewPageIcon />
            </Link>
          </li>
          <li>Click on a context menu and select "Edit Saved Searches"</li>
          <li>Remove unwanted filters</li>
        </ol>
        <Box
          component="img"
          sx={{ mb: 2, width: '100%' }}
          src={browser.runtime.getURL('edit-search.png' as PublicPath)}
        />
      </>
    ),
  },
  {
    title: 'Why do I see jobs 5 or more minutes after they were posted?',
    body: (
      <>
        Current extension calls Upwork API once every 60 seconds. If the
        extension notifies you about a job that was posted more than a minute
        ago, it means it was added to your feed with a delay by Upwork API.
        <br />
        <br />
        Some users report that purchasing Upwork Plus subscription removes this
        delay.
      </>
    ),
  },
  {
    title: 'Extension is not working',
    body: (
      <>
        <Typography variant="h6">Reinstall the extension</Typography>
        As a first step try reinstalling the extension and see if it's working:
        <ol>
          <li>
            If you use cover letter template - save it in a temporary text file
            to re-add later, as it will be erased.
          </li>
          <li>
            Open the extension page in{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://chrome.google.com/webstore/detail/upwork-toolkit-your-own-f/gcjmekbfkkmaccloaoccfiohjnmgkddm"
            >
              Chrome store <OpenNewPageIcon />
            </Link>
          </li>
          <li>Click on "Remove from Chrome" button and confirm action</li>
          <li>Click on "Add to Chrome" button and confirm</li>
        </ol>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Check your browser version
        </Typography>
        Due to{' '}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://developer.chrome.com/docs/extensions/mv3/intro/"
        >
          requirements from Google
          <OpenNewPageIcon />
        </Link>
        , starting from version 1.14.12 the extension is compatible only with
        Chrome 88 and later (or chromium-based browsers with corresponding
        version). Chrome 88 was released on January 19, 2021.
        <br />
        <br />
        If your browser is older, please update it and see if the extension
        works.
        <Typography variant="h6" sx={{ mt: 3 }}>
          Reach out to support
        </Typography>
        If the steps above have not fixed the issue - feel free to contact
        support via <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link>.
        <br />
        <br />
        Please include following information in your email to get help faster:
        <ul>
          <li>Browser name and version</li>
          <li>Extension version</li>
          <li>Problem description</li>
        </ul>
      </>
    ),
  },
  {
    title: 'How do I change notification sound?',
    body: (
      <>
        Unfortunately due to Chrome limitation it is currently impossible to use
        custom notification sound.
      </>
    ),
  },
  {
    title: 'How to request a feature?',
    body: (
      <>
        If you'd like to request a new feature or report a bug please send us an
        email via <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link>
      </>
    ),
  },
]

const Faq = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <>
      {sections.map((section, index) => (
        <Accordion
          disableGutters
          variant="outlined"
          key={section.title}
          onChange={(e, expanded) =>
            setSearchParams((previousParmas) => ({
              ...previousParmas,
              expanded: expanded ? String(index) : 'none',
            }))
          }
          defaultExpanded={searchParams.get('expanded') === String(index)}
        >
          <AccordionSummary
            sx={{ '& .MuiAccordionSummary-content': { my: 2 } }}
            expandIcon={<ExpandMore sx={{ fontSize: '2rem' }} />}
          >
            <Typography variant="h6">{section.title}</Typography>
          </AccordionSummary>

          <AccordionDetails>{section.body}</AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

export default Faq
