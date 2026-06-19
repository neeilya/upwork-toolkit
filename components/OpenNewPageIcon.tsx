import { Typography, type TypographyProps } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'

const OpenNewPageIcon = (props: TypographyProps) => (
  <Typography
    component={OpenInNew}
    sx={{ verticalAlign: 'middle', ...props.sx }}
    {...props}
  />
)

export default OpenNewPageIcon
