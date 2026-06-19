import { ReactNode } from 'react'
import { Box } from '@mui/material'

type Props = {
  children: ReactNode
}

const Emoji = (props: Props) => (
  <Box component="span" sx={{ lineHeight: 0, fontSize: '1.5rem' }}>
    {props.children}
  </Box>
)

export default Emoji
