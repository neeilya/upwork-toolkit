import { MouseEvent } from 'react'
import { SxProps } from '@mui/system'
import { Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'

type Props = {
  opened: boolean
  sx?: SxProps<Theme>
  onChange: (opened: boolean, e: MouseEvent) => any
}

const Toggle = (props: Props) => (
  <Typography
    variant="h6"
    component="button"
    sx={{
      ...props.sx,
      p: 0,
      opacity: 0.2,
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      background: 'none',
      '&:hover': { opacity: 1 },
    }}
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      props.onChange(!props.opened, e)
    }}
    onMouseDown={(e) => e.stopPropagation()}
  >
    [{props.opened ? '×' : '+'}]
  </Typography>
)

export default Toggle
