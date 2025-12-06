import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBuildingLine,
  RiGlobalLine,
  RiLockLine,
  RiVerifiedBadgeLine,
} from '@remixicon/react'
import { useKeyPress } from 'ahooks'
import Divider from '../../base/divider'
import Loading from '../../base/loading'
import Tooltip from '../../base/tooltip'
import { getKeyboardKeyCodeBySystem, getKeyboardKeyNameBySystem } from '../../workflow/utils'
import AccessControl from '../app-access-control'
import type { ModelAndParameter } from '../configuration/debug/types'
import PublishWithMultipleModel from './publish-with-multiple-model'
import { useStore as useAppStore } from '@/app/components/app/store'
import Button from '@/app/components/base/button'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import { appDefaultIconBackground } from '@/config'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useFormatTimeFromNow } from '@/hooks/use-format-time-from-now'
import { AccessMode } from '@/models/access-control'
import { useAppWhiteListSubjects, useGetUserCanAccessApp } from '@/service/access-control'
import { fetchAppDetailDirect } from '@/service/apps'
import { AppModeEnum } from '@/types/app'
import type { PublishWorkflowParams } from '@/types/workflow'
import { basePath } from '@/utils/var'
import UpgradeBtn from '@/app/components/billing/upgrade-btn'

const ACCESS_MODE_MAP: Record<AccessMode, { label: string, icon: React.ElementType }> = {
  [AccessMode.ORGANIZATION]: {
    label: 'organization',
    icon: RiBuildingLine,
  },
  [AccessMode.SPECIFIC_GROUPS_MEMBERS]: {
    label: 'specific',
    icon: RiLockLine,
  },
  [AccessMode.PUBLIC]: {
    label: 'anyone',
    icon: RiGlobalLine,
  },
  [AccessMode.EXTERNAL_MEMBERS]: {
    label: 'external',
    icon: RiVerifiedBadgeLine,
  },
}

const AccessModeDisplay: React.FC<{ mode?: AccessMode }> = ({ mode }) => {
  const { t } = useTranslation()

  if (!mode || !ACCESS_MODE_MAP[mode])
    return null

  const { icon: Icon, label } = ACCESS_MODE_MAP[mode]

  return (
    <>
      <Icon className='h-4 w-4 shrink-0 text-text-secondary' />
      <div className='grow truncate'>
        <span className='system-sm-medium text-text-secondary'>{t(`app.accessControlDialog.accessItems.${label}`)}</span>
      </div>
    </>
  )
}

export type AppPublisherProps = {
  disabled?: boolean
  publishDisabled?: boolean
  publishedAt?: number
  /** only needed in workflow / chatflow mode */
  draftUpdatedAt?: number
  debugWithMultipleModel?: boolean
  multipleModelConfigs?: ModelAndParameter[]
  /** modelAndParameter is passed when debugWithMultipleModel is true */
  onPublish?: (params?: any) => Promise<any> | any
  onRestore?: () => Promise<any> | any
  onToggle?: (state: boolean) => void
  crossAxisOffset?: number
  missingStartNode?: boolean
  hasTriggerNode?: boolean // Whether workflow currently contains any trigger nodes (used to hide missing-start CTA when triggers exist).
  startNodeLimitExceeded?: boolean
}

const PUBLISH_SHORTCUT = ['ctrl', '⇧', 'P']

const AppPublisher = ({
  disabled = false,
  publishDisabled = false,
  publishedAt,
  draftUpdatedAt,
  debugWithMultipleModel = false,
  multipleModelConfigs = [],
  onPublish,
  onRestore,
  onToggle,
  crossAxisOffset = 0,
  missingStartNode = false,
  hasTriggerNode = false,
  startNodeLimitExceeded = false,
}: AppPublisherProps) => {
  const { t } = useTranslation()

  const [published, setPublished] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [open, setOpen] = useState(false)
  const [showAppAccessControl, setShowAppAccessControl] = useState(false)
  const [isAppAccessSet, setIsAppAccessSet] = useState(true)

  const appDetail = useAppStore(state => state.appDetail)
  const setAppDetail = useAppStore(s => s.setAppDetail)
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)
  const { formatTimeFromNow } = useFormatTimeFromNow()

  const isChatApp = [AppModeEnum.CHAT, AppModeEnum.AGENT_CHAT, AppModeEnum.COMPLETION].includes(appDetail?.mode || AppModeEnum.CHAT)

  const { data: userCanAccessApp, isLoading: isGettingUserCanAccessApp, refetch } = useGetUserCanAccessApp({ appId: appDetail?.id, enabled: false })
  const { data: appAccessSubjects, isLoading: isGettingAppWhiteListSubjects } = useAppWhiteListSubjects(appDetail?.id, open && systemFeatures.webapp_auth.enabled && appDetail?.access_mode === AccessMode.SPECIFIC_GROUPS_MEMBERS)

  const noAccessPermission = useMemo(() => systemFeatures.webapp_auth.enabled && appDetail && appDetail.access_mode !== AccessMode.EXTERNAL_MEMBERS && !userCanAccessApp?.result, [systemFeatures, appDetail, userCanAccessApp])
  const disabledFunctionButton = useMemo(() => (!publishedAt || missingStartNode || noAccessPermission), [publishedAt, missingStartNode, noAccessPermission])

  useEffect(() => {
    if (systemFeatures.webapp_auth.enabled && open && appDetail)
      refetch()
  }, [open, appDetail, refetch, systemFeatures])

  useEffect(() => {
    if (appDetail && appAccessSubjects) {
      if (appDetail.access_mode === AccessMode.SPECIFIC_GROUPS_MEMBERS && appAccessSubjects.groups?.length === 0 && appAccessSubjects.members?.length === 0)
        setIsAppAccessSet(false)
      else
        setIsAppAccessSet(true)
    }
    else {
      setIsAppAccessSet(true)
    }
  }, [appAccessSubjects, appDetail])

  const handlePublish = useCallback(async (params?: ModelAndParameter | PublishWorkflowParams) => {
    setIsPublishing(true)
    try {
      await onPublish?.(params)
      setPublished(true)
    }
    catch {
      setPublished(false)
    }
    finally {
      setIsPublishing(false)
    }
  }, [onPublish])

  const handleRestore = useCallback(async () => {
    try {
      await onRestore?.()
      setOpen(false)
    }
    catch { }
  }, [onRestore])

  const handleTrigger = useCallback(() => {
    const state = !open

    if (disabled) {
      setOpen(false)
      return
    }

    onToggle?.(state)
    setOpen(state)

    if (state)
      setPublished(false)
  }, [disabled, onToggle, open])

  const handleAccessControlUpdate = useCallback(async () => {
    if (!appDetail)
      return
    try {
      const res = await fetchAppDetailDirect({ url: '/apps', id: appDetail.id })
      setAppDetail(res)
    }
    finally {
      setShowAppAccessControl(false)
    }
  }, [appDetail, setAppDetail])

  useKeyPress(`${getKeyboardKeyCodeBySystem('ctrl')}.shift.p`, (e) => {
    e.preventDefault()
    if (publishDisabled || published || isPublishing)
      return
    handlePublish()
  }, { exactMatch: true, useCapture: true })

  const showStartNodeLimitHint = Boolean(startNodeLimitExceeded)
  const upgradeHighlightStyle = useMemo(() => ({
    background: 'linear-gradient(97deg, var(--components-input-border-active-prompt-1, rgba(11, 165, 236, 0.95)) -3.64%, var(--components-input-border-active-prompt-2, rgba(21, 90, 239, 0.95)) 45.14%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }), [])

  return (
    <>
      <PortalToFollowElem
        open={open}
        onOpenChange={setOpen}
        placement='bottom-end'
        offset={{
          mainAxis: 4,
          crossAxis: crossAxisOffset,
        }}
      >
        <PortalToFollowElemTrigger onClick={handleTrigger}>
          <Button
            variant='primary'
            className='py-2 pl-3 pr-2'
            disabled={disabled || isPublishing}
          >
            {isPublishing ? t('workflow.common.publishing') : t('workflow.common.publish')}
            <RiArrowDownSLine className='h-4 w-4 text-components-button-primary-text' />
          </Button>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent className='z-[11]'>
          <div className='w-[320px] rounded-2xl border-[0.5px] border-components-panel-border bg-components-panel-bg shadow-xl shadow-shadow-shadow-5'>
            <div className='p-4 pt-3'>
              <div className='system-xs-medium-uppercase flex h-6 items-center text-text-tertiary'>
                {publishedAt ? t('workflow.common.latestPublished') : t('workflow.common.currentDraftUnpublished')}
              </div>
              {publishedAt
                ? (
                  <div className='flex items-center justify-between'>
                    <div className='system-sm-medium flex items-center text-text-secondary'>
                      {t('workflow.common.publishedAt')} {formatTimeFromNow(publishedAt)}
                    </div>
                    {isChatApp && <Button
                      variant='secondary-accent'
                      size='small'
                      onClick={handleRestore}
                      disabled={published}
                    >
                      {t('workflow.common.restore')}
                    </Button>}
                  </div>
                )
                : (
                  <div className='system-sm-medium flex items-center text-text-secondary'>
                    {t('workflow.common.autoSaved')} · {Boolean(draftUpdatedAt) && formatTimeFromNow(draftUpdatedAt!)}
                  </div>
                )}
              {debugWithMultipleModel
                ? (
                  <PublishWithMultipleModel
                    multipleModelConfigs={multipleModelConfigs}
                    onSelect={item => handlePublish(item)}
                  // textGenerationModelList={textGenerationModelList}
                  />
                )
                : (
                  <>
                    <Button
                      variant='primary'
                      className='mt-3 w-full'
                      onClick={() => handlePublish()}
                      disabled={publishDisabled || published || isPublishing}
                    >
                      {
                        isPublishing
                          ? t('workflow.common.publishing')
                          : published
                            ? t('workflow.common.published')
                            : (
                              <div className='flex gap-1'>
                                <span>{t('workflow.common.publishUpdate')}</span>
                                <div className='flex gap-0.5'>
                                  {PUBLISH_SHORTCUT.map(key => (
                                    <span key={key} className='system-kbd h-4 w-4 rounded-[4px] bg-components-kbd-bg-white text-text-primary-on-surface'>
                                      {getKeyboardKeyNameBySystem(key)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                      }
                    </Button>
                    {showStartNodeLimitHint && (
                      <div className='mt-3 flex flex-col items-stretch'>
                        <p
                          className='text-sm font-semibold leading-5 text-transparent'
                          style={upgradeHighlightStyle}
                        >
                          <span className='block'>{t('workflow.publishLimit.startNodeTitlePrefix')}</span>
                          <span className='block'>{t('workflow.publishLimit.startNodeTitleSuffix')}</span>
                        </p>
                        <p className='mt-1 text-xs leading-4 text-text-secondary'>
                          {t('workflow.publishLimit.startNodeDesc')}
                        </p>
                        <UpgradeBtn
                          isShort
                          className='mb-[12px] mt-[9px] h-[32px] w-[93px] self-start'
                        />
                      </div>
                    )}
                  </>
                )
              }
            </div>
            {(systemFeatures.webapp_auth.enabled && (isGettingUserCanAccessApp || isGettingAppWhiteListSubjects))
              ? <div className='py-2'><Loading /></div>
              : <>
                <Divider className='my-0' />
                {systemFeatures.webapp_auth.enabled && <div className='p-4 pt-3'>
                  <div className='flex h-6 items-center'>
                    <p className='system-xs-medium text-text-tertiary'>{t('app.publishApp.title')}</p>
                  </div>
                  <div className='flex h-8 cursor-pointer items-center gap-x-0.5  rounded-lg bg-components-input-bg-normal py-1 pl-2.5 pr-2 hover:bg-primary-50 hover:text-text-accent'
                    onClick={() => {
                      setShowAppAccessControl(true)
                    }}>
                    <div className='flex grow items-center gap-x-1.5 overflow-hidden pr-1'>
                      <AccessModeDisplay mode={appDetail?.access_mode} />
                    </div>
                    {!isAppAccessSet && <p className='system-xs-regular shrink-0 text-text-tertiary'>{t('app.publishApp.notSet')}</p>}
                    <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
                      <RiArrowRightSLine className='h-4 w-4 text-text-quaternary' />
                    </div>
                  </div>
                  {!isAppAccessSet && <p className='system-xs-regular mt-1 text-text-warning'>{t('app.publishApp.notSetDesc')}</p>}
                </div>}
              </>}
          </div>
        </PortalToFollowElemContent>
        {showAppAccessControl && <AccessControl app={appDetail!} onConfirm={handleAccessControlUpdate} onClose={() => { setShowAppAccessControl(false) }} />}
      </PortalToFollowElem >
    </>)
}

export default memo(AppPublisher)
