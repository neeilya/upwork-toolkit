import { useMediaQuery as useMuiMediaQuery } from '@mui/material'

const useMediaQuery = () => {
  const options = { noSsr: true }

  return {
    isDesktop: useMuiMediaQuery((theme) => theme.breakpoints.up('md'), options),
    isMobile: useMuiMediaQuery(
      (theme) => theme.breakpoints.only('xs'),
      options
    ),
    isTablet: useMuiMediaQuery(
      (theme) => theme.breakpoints.between('sm', 'md'),
      options
    ),
  }
}

export default useMediaQuery
