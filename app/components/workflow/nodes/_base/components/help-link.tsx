import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RiBookOpenLine } from '@remixicon/react'
import { useNodeHelpLink } from '../hooks/use-node-help-link'
import TooltipPlus from '@/app/components/base/tooltip'
import type { BlockEnum } from '@/app/components/workflow/types'

type HelpLinkProps = {
  nodeType: BlockEnum
}
const HelpLink = ({
  nodeType,
}: HelpLinkProps) => {
  const { t } = useTranslation()
  const link = useNodeHelpLink(nodeType)

  if (!link)
    return null

  return (
    <TooltipPlus
      popupContent={t('common.userProfile.helpCenter')}
    >
      <div
        className='mr-1 flex h-6 w-6 cursor-not-allowed items-center justify-center rounded-md opacity-50'
      >
        <RiBookOpenLine className='h-4 w-4 text-gray-500' />
      </div>
    </TooltipPlus>

  )
}

export default memo(HelpLink)
