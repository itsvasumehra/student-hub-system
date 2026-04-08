'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter } from 'lucide-react'

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  /** If true, this column header will not be sortable */
  disableSort?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T
  searchPlaceholder?: string
  /** Optional key to render a filter dropdown (e.g. 'category' or 'status') */
  filterKey?: keyof T
  filterLabel?: string
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  filterKey,
  filterLabel = 'Filter',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  // Collect unique values for the filter dropdown
  const filterOptions = useMemo(() => {
    if (!filterKey) return []
    const values = Array.from(
      new Set(data.map(item => String(item[filterKey] ?? '')).filter(Boolean))
    ).sort()
    return values
  }, [data, filterKey])

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredData = useMemo(() => {
    let result = data

    // Text search
    if (searchKey && searchQuery) {
      result = result.filter(item => {
        const val = item[searchKey]
        return typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    // Category / status filter
    if (filterKey && filterValue !== 'all') {
      result = result.filter(item => String(item[filterKey]) === filterValue)
    }

    return result
  }, [data, searchQuery, searchKey, filterKey, filterValue])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const SortIcon = ({ colKey }: { colKey: keyof T }) => {
    if (sortConfig.key !== colKey) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5" />
      : <ChevronDown className="w-3.5 h-3.5" />
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(searchKey || (filterKey && filterOptions.length > 0)) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-1">
          {searchKey && (
            <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-white/20 transition-all min-w-0">
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder:text-white/40 min-w-0"
              />
            </div>
          )}

          {filterKey && filterOptions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-white/20 transition-all">
              <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="bg-transparent border-none text-white text-sm focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all" className="text-black bg-white">All {filterLabel}s</option>
                {filterOptions.map(opt => (
                  <option key={opt} value={opt} className="text-black bg-white capitalize">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table — wrapped for mobile horizontal scroll */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-white/80 min-w-[480px]">
            <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`px-5 py-3.5 font-medium whitespace-nowrap ${
                      col.accessorKey && !col.disableSort
                        ? 'cursor-pointer hover:text-white/80 transition-colors select-none'
                        : ''
                    }`}
                    onClick={() => col.accessorKey && !col.disableSort && handleSort(col.accessorKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.accessorKey && !col.disableSort && (
                        <SortIcon colKey={col.accessorKey} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors last:border-0"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-5 py-3.5">
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? (row[col.accessorKey] as React.ReactNode)
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-10 text-center text-white/40"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count */}
      {data.length > 0 && (
        <p className="text-xs text-white/30 px-1">
          Showing {sortedData.length} of {data.length} row{data.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
