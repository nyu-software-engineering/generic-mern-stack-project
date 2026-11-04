/*
 * Helpers shared by the Add Application and Edit Application screens.
 */
import { validateEmail, validateRequired } from '../../utils/validation'

/** An empty recruiter contact */
export function emptyRecruiter() {
  return { name: '', email: '', phone: '' }
}

/**
 * Checks the form and returns the error messages ('' means no error).
 * Company and position are required. A recruiter's email is optional,
 * but if one is typed it must look like an email.
 */
export function getApplicationErrors(form) {
  return {
    company: validateRequired(form.company, 'Company'),
    position: validateRequired(form.position, 'Position'),
    recruiterEmails: form.recruiters.map((recruiter) => (recruiter.email ? validateEmail(recruiter.email) : '')),
  }
}

/** True when getApplicationErrors() found no problems */
export function isApplicationValid(errors) {
  return !errors.company && !errors.position && errors.recruiterEmails.every((message) => !message)
}

/** Leaves out recruiter contacts that were left completely empty */
export function removeEmptyRecruiters(recruiters) {
  return recruiters.filter(
    (recruiter) => recruiter.name.trim() || recruiter.email.trim() || recruiter.phone.trim(),
  )
}