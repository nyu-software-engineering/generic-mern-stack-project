import { useState } from 'react'
import { api } from '../../api'
import {
  ApplicationCard,
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  DateTile,
  EmptyState,
  ErrorState,
  EventCard,
  FileUpload,
  FilterChips,
  FormSection,
  Icon,
  IconButton,
  ListRow,
  LoadingState,
  Logo,
  OptionSheet,
  Page,
  RadioGroup,
  SearchBar,
  SectionHeader,
  SegmentedControl,
  SelectField,
  StatCard,
  StatusBadge,
  SuccessDialog,
  Switch,
  TextArea,
  TextField,
  ThemeToggle,
} from '../../components'
import { ICON_NAMES } from '../../components/Icon/icons'
import {
  APPLICATION_STATUSES,
  EXPORT_FORMATS,
  JOB_TYPES,
  SORT_OPTIONS,
} from '../../constants'
import { useApi } from '../../hooks/useApi'
import './ComponentGallery.css'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  ...APPLICATION_STATUSES.map((status) => ({ value: status.value, label: status.shortLabel })),
]

/**
 * Developer page at /dev/components: every shared component, live, in the current theme.
 * Use it to see what's available and copy the usage into your own page.
 */
export default function ComponentGallery() {
  const [text, setText] = useState('')
  const [jobType, setJobType] = useState('internship')
  const [status, setStatus] = useState('applied')
  const [remind, setRemind] = useState(true)
  const [format, setFormat] = useState('csv')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [fileName, setFileName] = useState('')
  const [dialog, setDialog] = useState(null) // "confirm" | "success" | "options" | null
  const [sort, setSort] = useState('newest')

  const { data: applications } = useApi(() => api.getApplications(), [])
  const { data: events } = useApi(() => api.getEvents(), [])
  const { data: stats } = useApi(() => api.getStatistics(), [])
  const sampleApplication = applications?.[0]
  const sampleEvent = events?.[0]
  const eventApplication = applications?.find((item) => item.id === sampleEvent?.applicationId)

  return (
    <Page title="Component gallery" back="/home" action={<ThemeToggle />}>
      <p className="text-muted text-small">
        Every shared component, live. Toggle the theme with the moon/sun button. Usage examples for each one are at the
        top of each component file.
      </p>

      <GallerySection name="Logo">
        <div className="row gallery__wrap">
          <Logo height={64} />
          <Logo height={28} wordmark />
          <Logo height={20} />
        </div>
      </GallerySection>

      <GallerySection name="Buttons">
        <Button fullWidth>Primary</Button>
        <Button variant="secondary" fullWidth>
          Secondary
        </Button>
        <div className="row">
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" icon="trash">
            Danger
          </Button>
          <Button size="sm" icon="plus">
            Small
          </Button>
        </div>
        <div className="row">
          <IconButton icon="plus" label="Add" variant="primary" />
          <IconButton icon="pencil" label="Edit" />
          <ThemeToggle />
        </div>
      </GallerySection>

      <GallerySection name="Form inputs">
        <FormSection title="Job">
          <TextField label="Company" required placeholder="e.g. Stripe" value={text} onChange={setText} />
          <TextField label="Email" type="email" placeholder="name@company.com" error="Enter a valid email" />
          <div className="field-row">
            <TextField label="Date applied" type="date" />
            <SelectField label="Status" options={APPLICATION_STATUSES} value={status} onChange={setStatus} />
          </div>
          <SegmentedControl label="Job type" options={JOB_TYPES} value={jobType} onChange={setJobType} />
          <TextArea label="Notes" placeholder="Any other notes" />
        </FormSection>
        <FileUpload label="Upload resume (PDF)" fileName={fileName} onChange={(file) => setFileName(file.name)} />
        <Card>
          <Switch label="Remind me" checked={remind} onChange={setRemind} />
          <ThemeToggle variant="switch" />
        </Card>
        <Card>
          <RadioGroup label="Format" options={EXPORT_FORMATS} value={format} onChange={setFormat} />
        </Card>
        <SearchBar placeholder="Search company or position" value={query} onChange={setQuery} />
        <FilterChips options={STATUS_FILTERS} value={filter} onChange={setFilter} />
      </GallerySection>

      <GallerySection name="Content">
        <SectionHeader title="Next up" actionLabel="See all" actionTo="/upcoming" />
        {sampleEvent && (
          <Card padding="none">
            <EventCard event={sampleEvent} application={eventApplication} />
          </Card>
        )}
        {sampleApplication && <ApplicationCard application={sampleApplication} />}
        {stats && (
          <div className="stat-grid">
            <StatCard value={stats.totalApplied} label="Total applied" />
            <StatCard value={stats.active} label="Active" />
            <StatCard value={stats.interviews} label="Interviews" />
          </div>
        )}
        <Card padding="none">
          <ListRow icon="pencil" title="Edit account" to="/profile/edit" />
          <ListRow icon="bell" title="Notification settings" to="/profile/notifications" />
          <ListRow icon="link" title="View job posting" subtitle="https://…" href="https://example.com" />
        </Card>
        <div className="row gallery__wrap">
          {APPLICATION_STATUSES.map((item) => (
            <StatusBadge key={item.value} status={item.value} short />
          ))}
        </div>
        <div className="row">
          <Avatar src="https://picsum.photos/seed/gallery/96/96" alt="Sample logo" />
          <Avatar src="https://picsum.photos/seed/person/96/96" alt="Sample person" shape="circle" />
          <Avatar alt="Missing image" />
          <DateTile date="2026-10-18" />
        </div>
      </GallerySection>

      <GallerySection name="Pop-ups">
        <div className="row gallery__wrap">
          <Button variant="secondary" size="sm" onClick={() => setDialog('confirm')}>
            ConfirmDialog
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setDialog('success')}>
            SuccessDialog
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setDialog('options')}>
            OptionSheet
          </Button>
        </div>
      </GallerySection>

      <GallerySection name="Loading, error and empty states">
        <Card>
          <LoadingState />
        </Card>
        <Card>
          <ErrorState message="Couldn't load applications." onRetry={() => {}} />
        </Card>
        <Card>
          <EmptyState icon="briefcase" title="No applications yet" message="Add your first application to start tracking it." />
        </Card>
      </GallerySection>

      <GallerySection name="Icons">
        <div className="gallery__icons">
          {ICON_NAMES.map((name) => (
            <span key={name} className="gallery__icon">
              <Icon name={name} />
              <span>{name}</span>
            </span>
          ))}
        </div>
      </GallerySection>

      <ConfirmDialog
        open={dialog === 'confirm'}
        title="Delete application?"
        message="This will permanently remove the application and its events."
        confirmLabel="Delete"
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />
      <SuccessDialog
        open={dialog === 'success'}
        title="Application saved"
        message="You can find it on your dashboard."
        onDone={() => setDialog(null)}
      />
      <OptionSheet
        open={dialog === 'options'}
        title="Sort by"
        options={SORT_OPTIONS}
        value={sort}
        onSelect={(value) => {
          setSort(value)
          setDialog(null)
        }}
        onCancel={() => setDialog(null)}
      />
    </Page>
  )
}

function GallerySection({ name, children }) {
  return (
    <section className="gallery__section">
      <h2>{name}</h2>
      {children}
    </section>
  )
}
