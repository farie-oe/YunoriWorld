import { useContext } from 'react'
import { ProfileContext } from '../context/ProfileContext'

export function useProfile() {
  return useContext(ProfileContext)
}
