import { createTheme as muiCreateTheme } from '@mui/material'

const fontWeightBold = 600

const blackPalette = {
  main: '#000',
  contrastText: '#fff',
}

const whitePalette = {
  main: '#fff',
  contrastText: '#000',
}

type ThemeProps = {
  darkMode: boolean
  appInitialized: boolean
}

const createTheme = (props: ThemeProps) =>
  muiCreateTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1000,
        xl: 1536,
      },
    },
    typography: {
      fontWeightBold: 600,
      fontFamily: 'Inter, sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    palette: {
      mode: props.darkMode ? 'dark' : 'light',
      primary: props.darkMode ? whitePalette : blackPalette,
      secondary: whitePalette,
      background: {
        paper: props.darkMode ? '#11171f' : '#fff',
        default: !props.appInitialized
          ? '#000'
          : props.darkMode
            ? '#0d1117'
            : '#f6f6f6',
      },
      success: {
        main: '#43a047',
        contrastText: '#fff',
      },
      info: {
        main: '#0290d1',
        contrastText: '#fff',
      },
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
      MuiAlert: {
        defaultProps: {
          variant: props.darkMode ? 'outlined' : 'standard',
        },
        styleOverrides: {
          root: {
            variants: [
              {
                props: { severity: 'warning', variant: 'standard' },
                style: { background: '#ffe1b9' },
              },
            ],
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '105%',
            borderRadius: '2rem',
            textTransform: 'none',
            padding: '0.5rem 1rem',
          },
          sizeSmall: {
            fontSize: '95%',
            padding: '0.25rem 0.75rem',
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: props.darkMode ? `1px solid #212121` : undefined,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            '&:not(:last-child)': {
              borderBottom: 'none',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: '0.25rem',
          },
        },
      },
    },
  })

export default createTheme
