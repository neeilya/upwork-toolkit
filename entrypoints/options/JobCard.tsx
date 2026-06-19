import {
  Box,
  Card,
  Chip,
  Rating,
  Tooltip,
  useTheme,
  CardHeader,
  Typography,
  CardContent,
  CardActionArea,
} from '@mui/material'
import moment from 'moment'
import Toggle from '@/components/Toggle'
import { SxProps } from '@mui/system'
import colors from '@/utils/colors'
import upworkApi, { Job } from '@/api/upwork'
import Handshake from '@/icons/Handshake'
import { Theme } from '@mui/material/styles'
import { Verified, LocationOn, CreditCardOff } from '@mui/icons-material'

const capitalizeFirst = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

export const unreadStyles = (
  theme: Theme,
  unseen: boolean
): SxProps<Theme> => ({
  backgroundColor: unseen
    ? theme.palette.mode === 'dark'
      ? colors.warningDark
      : colors.warning
    : undefined,
})

export type Props = {
  unseen: boolean
  expanded?: boolean
  job: Job
  onCollapse?: () => void
  onJobClick: (job: Job) => void
}

const JobCard = (props: Props) => {
  const theme = useTheme()

  return (
    <Card
      variant="outlined"
      key={props.job.ciphertext}
      sx={{ mb: props.expanded ? 1 : 3, mt: props.expanded ? 1 : 0 }}
    >
      <CardActionArea
        component="a"
        target="_blank"
        onClick={(e) => {
          e.preventDefault()
          props.onJobClick(props.job)
        }}
        rel="noopener noreferrer"
        href={upworkApi.viewUrl(props.job.ciphertext)}
        sx={{
          ...unreadStyles(theme, props.unseen),
          '& .MuiCardActionArea-focusHighlight': {
            backgroundColor: 'inherit',
          },
        }}
      >
        <CardHeader
          sx={{ pt: props.expanded ? 1 : undefined }}
          title={
            <strong>
              {props.expanded && props.onCollapse && (
                <Box
                  sx={{
                    right: 5,
                    bottom: 1,
                    mr: 3 / 8,
                    display: 'inline',
                    position: 'relative',
                  }}
                >
                  <Toggle opened onChange={props.onCollapse} />
                </Box>
              )}

              {props.job.clientRelation && (
                <Tooltip arrow title="Previous client">
                  <Handshake
                    color="info"
                    fontSize="large"
                    sx={{
                      mr: 1,
                      mt: '-100%',
                      position: 'relative',
                      top: props.expanded ? 10 : 9,
                    }}
                  />
                </Tooltip>
              )}

              <Box
                component="span"
                dangerouslySetInnerHTML={{ __html: props.job.title }}
                sx={{ position: 'relative', top: props.expanded ? 2 : 0 }}
              />
            </strong>
          }
          subheader={
            <>
              <Typography sx={{ fontWeight: 500 }} component="span">
                {props.job.type}&nbsp;
                {props.job.type === 'Hourly' &&
                  props.job.hourlyBudget.min !== 0 &&
                  props.job.hourlyBudget.max !== 0 &&
                  props.job.hourlyBudget.min !== props.job.hourlyBudget.max &&
                  `($${props.job.hourlyBudget.min}-$${props.job.hourlyBudget.max}) `}
                {props.job.type === 'Hourly' &&
                  props.job.hourlyBudget.min !== 0 &&
                  props.job.hourlyBudget.min === props.job.hourlyBudget.max &&
                  `($${props.job.hourlyBudget.min}) `}
                {props.job.engagement && props.job.engagement !== 'not_sure'
                  ? `• ${props.job.engagement} • `
                  : '• '}
                {props.job.tierText
                  ? `${capitalizeFirst(props.job.tierText)} • `
                  : ''}
                {props.job.type === 'Fixed-price' &&
                  `Est. budget: $${Number.parseFloat(
                    props.job.amount.amount
                  )} • `}
                {props.job.type === 'Hourly' &&
                  props.job.durationLabel &&
                  `${capitalizeFirst(props.job.durationLabel)} • `}
                {moment(props.job.renewedOn ?? props.job.createdOn).fromNow()}
              </Typography>
            </>
          }
          slotProps={{
            subheader: { sx: { mt: 1 } },
          }}
        />

        <CardContent>
          <Box
            component={Typography}
            sx={{
              fontSize: '1.05rem',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: props.job.description }}
          />

          {props.job.attrs?.length && (
            <Box
              sx={{
                mt: 4,
                gap: '0.5rem',
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              {props.job.attrs.map((tag) => (
                <Chip key={tag.prettyName} label={tag.prettyName} />
              ))}
            </Box>
          )}

          <Typography sx={{ mt: 4 }}>
            Proposals: <strong>{props.job.proposalsTier}</strong>
          </Typography>

          {props.job.client && (
            <Box
              sx={{
                mt: 2,
                gap: '0.5rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                color="textSecondary"
                sx={{
                  gap: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {props.job.client.paymentVerificationStatus === 1 ? (
                  <>
                    <Verified color="info" />
                    <strong>Payment verified</strong>
                  </>
                ) : (
                  <>
                    <CreditCardOff />
                    <strong>Payment unverified</strong>
                  </>
                )}
              </Typography>

              <Rating
                readOnly
                precision={0.1}
                value={props.job.client.totalFeedback}
              />

              {props.job.client.totalSpent && (
                <Typography>
                  <strong>
                    {Intl.NumberFormat('en-US', {
                      currency: 'USD',
                      style: 'currency',
                      maximumFractionDigits: 0,
                    }).format(props.job.client.totalSpent)}
                  </strong>{' '}
                  <Typography color="textSecondary" component="span">
                    spent
                  </Typography>
                </Typography>
              )}

              {props.job.client.location?.country && (
                <Typography color="textSecondary" sx={{ display: 'flex' }}>
                  <LocationOn color="error" />
                  {props.job.client.location.country}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default JobCard
