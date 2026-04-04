import { TbExternalLink, TbBook2, TbBrandYoutube, TbFileText, TbSchool } from 'react-icons/tb'

const TYPE_ICONS = {
  book:    TbBook2,
  video:   TbBrandYoutube,
  article: TbFileText,
  course:  TbSchool,
}

const DIFFICULTY_STYLES = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-red-100 text-red-700',
}

export default function ResourceCard({ resource }) {
  const { title, url, description, resource_type, difficulty } = resource
  const Icon = TYPE_ICONS[resource_type] ?? TbFileText

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="text-gray-400 shrink-0" size={18} />
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 truncate">
            {title}
          </h3>
        </div>
        <TbExternalLink className="text-gray-400 group-hover:text-brand-500 shrink-0 mt-0.5" size={16} />
      </div>

      {description && (
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <span className="text-xs font-medium text-gray-500 capitalize">{resource_type}</span>
        <span className="text-gray-300">·</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_STYLES[difficulty] ?? ''}`}>
          {difficulty}
        </span>
      </div>
    </a>
  )
}
