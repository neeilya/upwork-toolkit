import {
  Box,
  List,
  Dialog,
  Button,
  Switch,
  Checkbox,
  ListItem,
  InputLabel,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material'
import { v4 } from 'uuid'
import { compareAsc } from 'date-fns'
import { useContext, useState } from 'react'
import dateTime from '@/utils/dateTime'
import { TimeField } from '@mui/x-date-pickers'
import { Schedule } from '@/utils/globalState'
import Storage, { StorageInterface } from '@/contexts/storage'

const ScheduleDialog = (props: {
  schedule?: Schedule | null
  onSave: (schedule: Schedule) => void
  onCancel: () => void
}) => {
  const storage = useContext<StorageInterface>(Storage)

  const [schedule, setSchedule] = useState<Partial<Schedule>>({
    ...props.schedule,
  })

  const fromTimeIsBeforeToTime = Boolean(
    schedule.from &&
    schedule.to &&
    compareAsc(new Date(schedule.from), new Date(schedule.to)) === 1
  )

  return (
    <Dialog open={true} fullWidth maxWidth="xs" onClose={props.onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()

          props.onSave({
            ...(schedule as Schedule),
            days: (schedule.days ?? []).slice().sort(),
            id: props.schedule?.id ?? v4(),
          })
        }}
      >
        <DialogTitle>
          {props.schedule?.id ? 'Edit Schedule' : 'Add Schedule'}
        </DialogTitle>

        <DialogContent>
          <List>
            {dateTime
              .getSortedDays(storage.globalState.usTimeFormat)
              .map((day) => (
                <ListItem
                  key={day.index}
                  secondaryAction={
                    <Checkbox
                      id={day.name}
                      onChange={(event, checked) =>
                        setSchedule({
                          ...schedule,
                          days: checked
                            ? [...(schedule.days ?? []), day.index]
                            : (schedule.days ?? []).filter(
                                (index) => index !== day.index
                              ),
                        })
                      }
                      defaultChecked={props.schedule?.days.includes(day.index)}
                    />
                  }
                >
                  <ListItemText secondary>
                    <InputLabel htmlFor={day.name}>{day.name}</InputLabel>
                  </ListItemText>
                </ListItem>
              ))}
          </List>

          <Box sx={{ display: 'flex', gap: 3, mt: 2, px: 1 }}>
            <TimeField
              required
              label="From"
              defaultValue={schedule.from ? new Date(schedule.from) : null}
              onChange={(value, { validationError }) =>
                !validationError &&
                setSchedule({ ...schedule, from: String(value) })
              }
              format={storage.globalState.usTimeFormat ? 'hh:mm a' : 'HH:mm'}
            />
            <TimeField
              required
              label="To"
              defaultValue={schedule.to ? new Date(schedule.to) : null}
              error={fromTimeIsBeforeToTime}
              helperText={
                fromTimeIsBeforeToTime
                  ? '"To" time must be greater than "From" time'
                  : ''
              }
              onChange={(value, { validationError }) =>
                !validationError &&
                setSchedule({ ...schedule, to: String(value) })
              }
              format={storage.globalState.usTimeFormat ? 'hh:mm a' : 'HH:mm'}
            />
          </Box>

          <Box sx={{ mt: 1, px: 1, textAlign: 'right' }}>
            <FormControlLabel
              label="24H format"
              labelPlacement="start"
              control={
                <Switch
                  onChange={(event, usTimeFormat) =>
                    storage.setState({ usTimeFormat: !usTimeFormat })
                  }
                  defaultChecked={!storage.globalState.usTimeFormat}
                />
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!schedule.days?.length || fromTimeIsBeforeToTime}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ScheduleDialog
