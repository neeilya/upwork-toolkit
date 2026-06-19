import { ReactNode } from 'react'
import { AlertProps, Button, Box, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AlertTitleProps, Typography } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

type RenderProps = {
  onInteracted?: () => void
}

export type Alert = {
  id: string
  title: ReactNode
  titleProps?: AlertTitleProps
  variant?: AlertProps['variant']
  severity: AlertProps['severity']
  renderBody: (props: RenderProps) => ReactNode
}

const all: Alert[] = [
  // {
  //   id: '0',
  //   severity: 'info',
  //   variant: 'filled',
  //   title: (
  //     <>
  //       Welcome to Upwork toolkit <Emoji>🚀</Emoji>
  //     </>
  //   ),
  //   titleProps: { sx: { fontWeight: 600 } },
  //   renderBody: () => (
  //     <Typography sx={{ fontWeight: 500 }}>
  //       Your new Upwork assistant has arrived <Emoji>🥳</Emoji>
  //       <Box component="ul" sx={{ paddingInlineStart: 3 }}>
  //         <li>
  //           Apply to jobs with single click using{' '}
  //           <Link component={RouterLink} to="/options/cover-letter">
  //             cover letter templates
  //           </Link>
  //         </li>
  //         <li>
  //           Disable notification sound or adjust volume in{' '}
  //           <Link component={RouterLink} to="/options/settings">
  //             settings
  //           </Link>
  //         </li>
  //         <li>
  //           Subscribe to any of{' '}
  //           <Link
  //             component={RouterLink}
  //             to="/options/settings?feedSelectOpen=true"
  //           >
  //             three job feeds
  //           </Link>{' '}
  //           in Upwork
  //         </li>
  //         <li>
  //           Schedule jobs fetching to match your{' '}
  //           <Link
  //             component={RouterLink}
  //             to="/options/settings?addSchedule=true"
  //           >
  //             working hours
  //           </Link>
  //         </li>
  //         <li>
  //           Enjoy new{' '}
  //           <Link
  //             component={RouterLink}
  //             to="/options/settings?nightModeOpen=true"
  //           >
  //             night mode
  //           </Link>
  //         </li>
  //       </Box>
  //     </Typography>
  //   ),
  // },
  // {
  //   id: '1',
  //   variant: 'filled',
  //   severity: 'success',
  //   title: 'Enjoying Upwork toolkit?',
  //   titleProps: { sx: { fontWeight: 600 } },
  //   renderBody: (props) => (
  //     <>
  //       <Rating
  //         color="success"
  //         readOnly
  //         sx={{
  //           '& .MuiRating-icon': (theme) => ({
  //             filter: 'brightness(0.5)',
  //             color: theme.palette.success.main,
  //           }),
  //         }}
  //         value={100}
  //       />
  //
  //       <Typography sx={{ fontWeight: 500 }}>
  //         Please consider writing a review.
  //         <br />
  //         It will help us make extension even better for you!
  //       </Typography>
  //
  //       <Button
  //         sx={{ mt: 2 }}
  //         target="_blank"
  //         variant="contained"
  //         rel="noreferrer noopener"
  //         onClick={props.onInteracted}
  //         href="https://chrome.google.com/webstore/detail/upwork-toolkit-your-perso/gcjmekbfkkmaccloaoccfiohjnmgkddm"
  //       >
  //         Write a review
  //       </Button>
  //     </>
  //   ),
  // },
  // {
  //   id: '2',
  //   variant: 'filled',
  //   severity: 'info',
  //   title: 'Do you know you can schedule jobs fetching?',
  //   titleProps: { sx: { fontWeight: 600 } },
  //   renderBody: (props) => (
  //     <>
  //       <Typography>
  //         Say goodbye to distractions during your personal time.
  //         <br />
  //         From now on you have complete control over when jobs are fetched.
  //         <br />
  //         <br />
  //         Schedule fetching according to your working hours:
  //       </Typography>
  //
  //       <Button
  //         sx={{ mt: 2 }}
  //         variant="contained"
  //         component={RouterLink}
  //         onClick={props.onInteracted}
  //         to="/options/settings?addSchedule=true"
  //       >
  //         Add schedule
  //       </Button>
  //     </>
  //   ),
  // },
  {
    id: '15',
    variant: 'filled',
    severity: 'info',
    title: 'I have some good news to share 🎉',
    titleProps: { sx: { fontWeight: 600 } },
    renderBody: (props) => (
      <>
        <Box
          component="ul"
          sx={{
            fontSize: '105%',
            paddingInlineStart: 3,
            my: 1,
            '& li': { mt: 2 },
          }}
        >
          <li>
            <strong>
              Upwork Toolkit is now fully open source. Check out the source code
              on{' '}
              <Link
                href={import.meta.env.WXT_GITHUB_URL}
                color="inherit"
                target="_blank"
                rel="noopener"
              >
                GitHub
                <OpenInNew sx={{ verticalAlign: 'middle', fontSize: '100%' }} />
              </Link>
            </strong>
            . Inspect it, learn from it and contribute :)
          </li>
          <li>
            <strong>
              You can now apply to jobs with custom-tailored AI generated cover
              letters
            </strong>{' '}
            — just add you OpenAI API key by clicking the button below.
          </li>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/cover-letter"
          >
            Set up OpenAI API key
          </Button>
        </Box>
      </>
    ),
  },
]

export default all
