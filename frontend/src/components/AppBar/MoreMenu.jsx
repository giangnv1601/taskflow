import { useState } from 'react'
import { Box, Button, Menu, MenuItem, Divider } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'

function MoreMenu() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box>
      <Button
        sx={{ color: 'white' }}
        aria-controls={open ? 'more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
                More
      </Button>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-more',
          sx: {
            display: 'block', // Keep the MoreMenu items vertically aligned
            padding: 0
          },
        }}
      >
        <MenuItem>
          <Workspaces />
        </MenuItem>
        <MenuItem>
          <Recent />
        </MenuItem>
        <MenuItem>
          <Starred />
        </MenuItem>
        <MenuItem>
          <Templates />
        </MenuItem>
        <Divider />
      </Menu>
    </Box>
  )
}

export default MoreMenu
