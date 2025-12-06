'use client'
import TabHeader from '@/app/components/base/tab-header'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export enum TabType {
  settings = 'settings',
  lastRun = 'lastRun',
  relations = 'relations',
}

type Props = {
  value: TabType,
  onChange: (value: TabType) => void
  hideTabs?: boolean // Add option to hide tabs completely
}

const Tab: FC<Props> = ({
  value,
  onChange,
  hideTabs = false,
}) => {
  const { t } = useTranslation()

  // If hideTabs is true, return null to hide the entire tab component
  if (hideTabs)
    return null

  return (
    <TabHeader
      items={[
        { id: TabType.settings, name: t('workflow.debug.settingsTab').toLocaleUpperCase() },
        { id: TabType.lastRun, name: t('workflow.debug.lastRunTab').toLocaleUpperCase() },
      ]}
      itemClassName='ml-0'
      value={value}
      onChange={onChange as any}
    />
  )
}
export default React.memo(Tab)
