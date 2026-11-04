import { useState } from 'react'
import { Outlet } from 'react-router'

// Keeps completed lesson ids in one place so the hub and lesson pages stay in sync.
function LearnLayout() {
  const [completedLessons, setCompletedLessons] = useState([])

  return <Outlet context={{ completedLessons, setCompletedLessons }} />
}

export default LearnLayout
