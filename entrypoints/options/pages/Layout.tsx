import GithubIcon from '@/components/GithubIcon'
import XIcon from '@/components/XIcon'
import Storage, { StorageInterface } from '@/contexts/storage'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Event, eventEmitter } from '@/utils/events'
import extension from '@/utils/extension'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'

type MenuLink = {
  text: string | React.ReactNode
  href: string
  new?: boolean
  count?: number
}

export type LayoutContext = {
  headerContainer: RefObject<null>
}

const SIDEBAR_WIDTH = 180

const Layout = () => {
  const location = useLocation()
  const { isDesktop } = useMediaQuery()
  const headerContainer = useRef(null)
  const storage = useContext<StorageInterface>(Storage)
  const exposedApi: LayoutContext = { headerContainer }

  const [debugMode, setDebugMode] = useState(false)
  const [unseenIds, setUnseenIds] = useState<string[]>([])

  const unseenJobs = storage.jobs.filter((job) => !job.__isSeen)

  const socialLinks = [
    { href: import.meta.env.WXT_GITHUB_URL, label: 'GitHub', Icon: GithubIcon },
    { href: import.meta.env.WXT_X_URL, label: 'X', Icon: XIcon, fontSize: 18 },
  ].filter((link) => link.href)

  const menuLinks: MenuLink[] = [
    { text: 'Jobs', href: '', count: unseenIds.length || unseenJobs.length },
    { text: 'Cover letter', href: 'cover-letter', new: true },
    { text: 'Settings', href: 'settings' },
    ...(import.meta.env.DEV || debugMode
      ? [
          { text: 'Debug', href: 'debug' },
          { text: 'Logs', href: 'logs' },
        ]
      : []),
    { text: 'FAQs', href: 'faq' },
  ]

  const currentTab = menuLinks.findIndex(
    (link) => `/${link.href}` === location.pathname
  )

  useEffect(() => {
    const enableDebugMode = () => setDebugMode(true)

    eventEmitter.on(Event.UNSEEN_IDS_UPDATED, setUnseenIds)
    eventEmitter.on(Event.DEBUG_MODE_TRIGGERED, enableDebugMode)

    return () => {
      eventEmitter.off(Event.UNSEEN_IDS_UPDATED, setUnseenIds)
      eventEmitter.off(Event.DEBUG_MODE_TRIGGERED, enableDebugMode)
    }
  }, [eventEmitter])

  return (
    <>
      <AppBar
        elevation={0}
        position="fixed"
        sx={{ background: '#000', color: '#fff' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Button
              to="/"
              variant="text"
              color="secondary"
              component={RouterLink}
              sx={{ mr: 2, borderRadius: 0, px: 0.75, alignSelf: 'stretch' }}
            >
              Upwork Toolkit
            </Button>

            <Box ref={headerContainer} sx={{ flexGrow: 1 }}></Box>

            {socialLinks.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, ml: 3 }}>
                {socialLinks.map(({ href, label, Icon, fontSize }) => (
                  <IconButton
                    key={label}
                    href={href}
                    component="a"
                    target="_blank"
                    color="inherit"
                    aria-label={label}
                    rel="noopener noreferrer"
                  >
                    <Icon sx={{ fontSize: fontSize || 24 }} />
                  </IconButton>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 2, pb: 3 }}>
        {!isDesktop && (
          <Tabs
            sx={{ mb: 2 }}
            variant="scrollable"
            value={currentTab !== -1 ? currentTab : 0}
          >
            {menuLinks.map((link) => (
              <Tab
                to={link.href}
                key={link.href}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {link.text}
                    {link.new || (link.count && link.count > 0) ? (
                      <Chip
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                        label={link.count || 'New'}
                      />
                    ) : null}
                  </Box>
                }
                component={RouterLink}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Tabs>
        )}

        <Box>
          {isDesktop && (
            <Box sx={{ width: SIDEBAR_WIDTH, position: 'fixed' }}>
              <List dense>
                {menuLinks.map((link) => (
                  <ListItem
                    to={link.href}
                    disablePadding
                    key={link.href}
                    component={RouterLink}
                    sx={{ color: 'inherit' }}
                  >
                    <ListItemButton
                      sx={{ borderRadius: 10 }}
                      selected={location.pathname === `/${link.href}`}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              gap: 1,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              color={
                                location.pathname === `/${link.href}`
                                  ? 'primary'
                                  : '#797979'
                              }
                              sx={{
                                fontWeight: 500,
                              }}
                            >
                              {link.text}
                            </Typography>
                            {link.new || (link.count && link.count > 0) ? (
                              <Chip
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                                label={link.count || 'New'}
                              />
                            ) : null}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Box
            sx={{
              pt: { md: 1 },
              ml: (theme) =>
                isDesktop
                  ? `calc(${SIDEBAR_WIDTH}px + ${theme.spacing(2)})`
                  : undefined,
            }}
          >
            <Outlet context={exposedApi} />
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default Layout
