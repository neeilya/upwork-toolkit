import Storage, { StorageInterface } from '@/contexts/storage'
import useMediaQuery from '@/hooks/useMediaQuery'
import errors from '@/utils/errors'
import jobFiltersStorage, {
  BudgetType,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
  JobFiltersConfig,
} from '@/utils/jobFilters'
import { filterJobs } from '@/utils/matchJob'
import { captureException } from '@/utils/sentry'
import { Save } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  MenuItem,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useContext, useState } from 'react'

const ChipInput = (props: {
  label: string
  placeholder?: string
  value: string[]
  disabled?: boolean
  onChange: (value: string[]) => void
}) => (
  <Autocomplete
    multiple
    freeSolo
    options={[] as string[]}
    value={props.value}
    disabled={props.disabled}
    onChange={(_, value) => props.onChange(value)}
    renderInput={(params) => (
      <TextField
        {...params}
        label={props.label}
        placeholder={props.placeholder}
        helperText="Type and press Enter to add"
      />
    )}
  />
)

const NumberField = (props: {
  label: string
  value: number | null
  disabled?: boolean
  adornment?: string
  placeholder?: string
  onChange: (value: number | null) => void
}) => (
  <TextField
    fullWidth
    type="number"
    label={props.label}
    value={props.value ?? ''}
    disabled={props.disabled}
    placeholder={props.placeholder}
    onChange={(e) => {
      const raw = e.target.value
      const parsed = Number(raw)
      props.onChange(raw === '' || Number.isNaN(parsed) ? null : parsed)
    }}
    slotProps={
      props.adornment
        ? {
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {props.adornment}
                </InputAdornment>
              ),
            },
          }
        : undefined
    }
  />
)

const Row = (props: { children: React.ReactNode }) => (
  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    {props.children}
  </Box>
)

const Filters = () => {
  const { isMobile } = useMediaQuery()
  const { enqueueSnackbar } = useSnackbar()
  const storage = useContext<StorageInterface>(Storage)

  const [config, setConfig] = useState<JobFiltersConfig>(storage.jobFilters)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<JobFiltersConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }))

  const toggleExperience = (level: ExperienceLevel) =>
    update({
      experienceLevels: config.experienceLevels.includes(level)
        ? config.experienceLevels.filter((value) => value !== level)
        : [...config.experienceLevels, level],
    })

  // Live preview against the currently stored jobs, ignoring the enable toggle.
  const total = storage.jobs.length
  const matching = filterJobs(storage.jobs, { ...config, enabled: true }).length

  const onSave = async () => {
    setSaving(true)
    try {
      await jobFiltersStorage.save(config)
      enqueueSnackbar('Your filters have been saved', { variant: 'success' })
    } catch (error) {
      captureException(error)
      enqueueSnackbar(errors.getErrorMessage(error), { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" component="h6">
        Filter your job feed
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>How this works</AlertTitle>
        These filters refine the jobs your feed already returns — hiding
        non-matching jobs from the list and stopping them from notifying you.
        Because the extension has no server, it can only filter jobs Upwork puts
        in your selected feed; it can't search all of Upwork. For a wider net,
        tune your Saved Search on Upwork itself.
      </Alert>

      <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
          }
          label="Enable filters"
        />
        <FormControlLabel
          control={
            <Switch
              checked={config.strictMode}
              onChange={(e) => update({ strictMode: e.target.checked })}
            />
          }
          label="Strict mode"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Strict mode drops jobs that are missing data for a filter you set (e.g.
        a client with no rating). Off by default (missing data passes).
      </Typography>

      <Alert severity={matching === total ? 'info' : 'success'} sx={{ mt: 2 }}>
        <strong>{matching}</strong> of your last <strong>{total}</strong> jobs
        match these filters.
      </Alert>

      {/* Keywords */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Keywords</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Matched against the job title and description.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <ChipInput
            label="Must include any of"
            placeholder="e.g. laravel, react, api"
            value={config.includeKeywords}
            disabled={saving}
            onChange={(value) => update({ includeKeywords: value })}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <ChipInput
            label="Exclude if it contains"
            placeholder="e.g. wordpress, logo, data entry"
            value={config.excludeKeywords}
            disabled={saving}
            onChange={(value) => update({ excludeKeywords: value })}
          />
        </Box>
      </Paper>

      {/* Skills */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Skills</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Matches the job's skill tags. Use the exact Upwork skill name (e.g.
          "React", not "reactjs").
        </Typography>

        <Box sx={{ mt: 2 }}>
          <ChipInput
            label="Require at least one skill"
            placeholder="e.g. Laravel, PHP"
            value={config.requireSkills}
            disabled={saving}
            onChange={(value) => update({ requireSkills: value })}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <ChipInput
            label="Exclude these skills"
            placeholder="e.g. WordPress, Shopify"
            value={config.excludeSkills}
            disabled={saving}
            onChange={(value) => update({ excludeSkills: value })}
          />
        </Box>
      </Paper>

      {/* Budget */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Budget</Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="Budget type"
            value={config.budgetType}
            disabled={saving}
            onChange={(e) =>
              update({ budgetType: e.target.value as BudgetType })
            }
          >
            <MenuItem value="any">Both fixed &amp; hourly</MenuItem>
            <MenuItem value="fixed">Fixed-price only</MenuItem>
            <MenuItem value="hourly">Hourly only</MenuItem>
          </TextField>
        </Box>

        {config.budgetType !== 'fixed' && (
          <Row>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <NumberField
                label="Min hourly rate"
                adornment="$"
                value={config.minHourly}
                disabled={saving}
                onChange={(value) => update({ minHourly: value })}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <NumberField
                label="Max hourly rate"
                adornment="$"
                value={config.maxHourly}
                disabled={saving}
                onChange={(value) => update({ maxHourly: value })}
              />
            </Box>
          </Row>
        )}

        {config.budgetType !== 'hourly' && (
          <Row>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <NumberField
                label="Min fixed budget"
                adornment="$"
                value={config.minFixed}
                disabled={saving}
                onChange={(value) => update({ minFixed: value })}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <NumberField
                label="Max fixed budget"
                adornment="$"
                value={config.maxFixed}
                disabled={saving}
                onChange={(value) => update({ maxFixed: value })}
              />
            </Box>
          </Row>
        )}
      </Paper>

      {/* Job */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Job</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Experience level (any if none selected)
        </Typography>
        <FormGroup row>
          {EXPERIENCE_LEVELS.map((level) => (
            <FormControlLabel
              key={level}
              control={
                <Checkbox
                  checked={config.experienceLevels.includes(level)}
                  disabled={saving}
                  onChange={() => toggleExperience(level)}
                />
              }
              label={level}
            />
          ))}
        </FormGroup>

        <FormControlLabel
          sx={{ mt: 1, display: 'flex' }}
          control={
            <Switch
              checked={config.repeatClientsOnly}
              disabled={saving}
              onChange={(e) => update({ repeatClientsOnly: e.target.checked })}
            />
          }
          label="Only clients I've worked with before"
        />
        <FormControlLabel
          sx={{ display: 'flex' }}
          control={
            <Switch
              checked={config.excludeApplied}
              disabled={saving}
              onChange={(e) => update({ excludeApplied: e.target.checked })}
            />
          }
          label="Hide jobs I've already applied to"
        />
      </Paper>

      {/* Client */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Client</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Minimum client rating: <strong>{config.minRating ?? 'any'}</strong>
        </Typography>
        <Slider
          min={0}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
          value={config.minRating ?? 0}
          disabled={saving}
          onChange={(_, value) =>
            update({
              minRating: (value as number) === 0 ? null : (value as number),
            })
          }
        />

        <Row>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <NumberField
              label="Min reviews"
              value={config.minReviews}
              disabled={saving}
              onChange={(value) => update({ minReviews: value })}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <NumberField
              label="Min hires"
              value={config.minHires}
              disabled={saving}
              onChange={(value) => update({ minHires: value })}
            />
          </Box>
        </Row>

        <Row>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <NumberField
              label="Min total spent"
              adornment="$"
              value={config.minSpent}
              disabled={saving}
              onChange={(value) => update({ minSpent: value })}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <NumberField
              label="Max total spent"
              adornment="$"
              value={config.maxSpent}
              disabled={saving}
              onChange={(value) => update({ maxSpent: value })}
            />
          </Box>
        </Row>

        <Box sx={{ mt: 2 }}>
          <ChipInput
            label="Exclude clients from"
            placeholder="e.g. India, Pakistan"
            value={config.excludeCountries}
            disabled={saving}
            onChange={(value) => update({ excludeCountries: value })}
          />
        </Box>

        <FormControlLabel
          sx={{ mt: 1, display: 'flex' }}
          control={
            <Switch
              checked={config.paymentVerifiedOnly}
              disabled={saving}
              onChange={(e) =>
                update({ paymentVerifiedOnly: e.target.checked })
              }
            />
          }
          label="Payment-method verified clients only"
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: 'right' }}>
        <Button
          color="primary"
          endIcon={<Save />}
          variant="contained"
          fullWidth={isMobile}
          onClick={onSave}
          disabled={saving}
        >
          Save filters
        </Button>
      </Box>
    </Box>
  )
}

export default Filters
