import { MdVerified } from 'react-icons/md'

interface Props {
  size?: number
  className?: string
}

export default function SelinhoVerificado({ size = 16, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center text-success ${className}`}>
      <MdVerified size={size} />
    </span>
  )
}
