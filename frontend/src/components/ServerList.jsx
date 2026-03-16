import { Edit, ExternalLink, Trash2 } from 'lucide-react'

import StatusBadge from './StatusBadge'

export default function ServerList({ servers, statuses, onDelete, onEdit, showActions, variant = 'admin' }) {
  const getStatus = (id) => statuses.find((s) => s.id === id)
  const isPublicView = variant === 'public'
  const panelTitle = isPublicView ? 'Public Status' : 'Server List'
  const emptyMessage = isPublicView ? 'No services available right now' : 'No servers added yet'

  if (servers.length === 0) {
    return (
      <div className="app-panel overflow-hidden rounded-xl border sm:rounded-2xl">
        <div className="app-panel-header px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-bold text-white sm:text-lg">{panelTitle}</h3>
        </div>
        <div className="px-4 py-12 text-center sm:px-6">
          <div className="app-muted text-sm">{emptyMessage}</div>
        </div>
      </div>
    )
  }

  return (
      <>
        <div className="app-panel hidden overflow-hidden rounded-2xl border md:block">
          <div className="app-panel-header px-6 py-4">
            <h3 className="text-lg font-bold text-white">{panelTitle}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isPublicView ? 'Service Name' : 'Server Name'}
                  </th>
                  {!isPublicView && (
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">URL</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  {!isPublicView && (
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                      Response Time
                    </th>
                  )}
                  {showActions && (
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                      Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/95">
              {servers.map((server) => {
                const status = getStatus(server.id)
                return (
                  <tr key={server.id} className="transition-colors duration-200 hover:bg-sky-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{server.name}</div>
                    </td>
                    {!isPublicView && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={server.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex max-w-xs items-center gap-2 truncate text-sm font-semibold text-sky-700 transition-colors hover:text-sky-900 hover:underline"
                        >
                          <span className="truncate">{server.url}</span>
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <StatusBadge status={status?.status || 'unknown'} />
                    </td>
                    {!isPublicView && (
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {status?.response_ms ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              {status.response_ms}ms
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </span>
                      </td>
                    )}
                    {showActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit?.(server)}
                            className="rounded-lg p-2 text-sky-700 transition-all duration-200 hover:bg-sky-100 hover:scale-105"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDelete?.(server.id)}
                            className="rounded-lg p-2 text-rose-700 transition-all duration-200 hover:bg-rose-100 hover:scale-105"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div className="app-panel-header rounded-t-xl px-4 py-3">
          <h3 className="text-base font-bold text-white">{panelTitle}</h3>
        </div>
        {servers.map((server) => {
          const status = getStatus(server.id)
          return (
            <div key={server.id} className="app-panel rounded-xl border p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-slate-900">{server.name}</h4>
                  {!isPublicView && (
                    <a
                      href={server.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-sky-700 transition-colors hover:text-sky-900 hover:underline sm:text-sm"
                    >
                      <span className="truncate">{server.url}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  )}
                </div>
                {showActions && (
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(server)}
                      className="rounded-lg p-1.5 text-sky-700 transition-all duration-200 hover:bg-sky-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(server.id)}
                      className="rounded-lg p-1.5 text-rose-700 transition-all duration-200 hover:bg-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {isPublicView ? (
                <div className="border-t border-slate-200 pt-3">
                  <StatusBadge status={status?.status || 'unknown'} />
                </div>
              ) : (
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <StatusBadge status={status?.status || 'unknown'} />
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">
                    {status?.response_ms ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {status.response_ms}ms
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
