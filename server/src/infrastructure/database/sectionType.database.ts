import prisma from '../../lib/prisma.js'

export const listSectionTypes = () =>
  prisma.sectionType.findMany({ orderBy: { name: 'asc' } })
