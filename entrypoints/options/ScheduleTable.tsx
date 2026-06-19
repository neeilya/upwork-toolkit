import {
  Box,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableContainer,
} from '@mui/material'
import { useContext, useState } from 'react'
import dateTime from '@/utils/dateTime'
import ScheduleDialog from './ScheduleDialog'
import { Schedule } from '@/utils/globalState'
import Storage, { StorageInterface } from '@/contexts/storage'
import { AddCircle, Delete, Edit } from '@mui/icons-material'

const ScheduleTable = (props: {
  schedules: Schedule[]
  onDelete: (schedule: Schedule) => void
  onCreated: (schedule: Schedule) => void
  onUpdated: (schedule: Schedule) => void
}) => {
  const storage = useContext<StorageInterface>(Storage)

  const [createMode, setCreateMode] = useState(false)
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null)

  return (
    <>
      {props.schedules.length === 0 && (
        <Typography sx={{ width: '100%', textAlign: 'center' }}>
          No schedules found.
          <br />
          Extension works all the time.
        </Typography>
      )}

      {props.schedules.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell sx={{ width: '40%' }}>
                    {dateTime
                      .getSortedDays(storage.globalState.usTimeFormat)
                      .filter((day) => schedule.days.includes(day.index))
                      .map((day) => day.name)
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    {dateTime.getHours(
                      schedule.from,
                      storage.globalState.usTimeFormat
                    )}
                  </TableCell>
                  <TableCell>
                    {dateTime.getHours(
                      schedule.to,
                      storage.globalState.usTimeFormat
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton onClick={() => setEditSchedule(schedule)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      sx={{ ml: 1 }}
                      onClick={() => props.onDelete(schedule)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box
        sx={{
          mt: 2,
          textAlign: 'right',
          alignSelf: props.schedules.length > 0 ? 'flex-end' : undefined,
        }}
      >
        <Button endIcon={<AddCircle />} onClick={() => setCreateMode(true)}>
          Add schedule
        </Button>
      </Box>

      {createMode && (
        <ScheduleDialog
          onCancel={() => setCreateMode(false)}
          onSave={(createdSchedule) => {
            setCreateMode(false)
            props.onCreated(createdSchedule)
          }}
        />
      )}

      {editSchedule && (
        <ScheduleDialog
          schedule={editSchedule}
          onCancel={() => setEditSchedule(null)}
          onSave={(updatedSchedule) => {
            setEditSchedule(null)
            props.onUpdated(updatedSchedule)
          }}
        />
      )}
    </>
  )
}

export default ScheduleTable
