import { Router } from 'express'
import { countriesRouter } from './countries.js'
import { objectivesRouter } from './objectives.js'
import { campaignsRouter } from './campaigns.js'
import { generatedCampaignsRouter } from './generatedCampaigns.js'
import { metaRouter } from './meta.js'
import { financeRouter } from './finance.js'

export function apiRouter() {
  const router = Router()

  router.get('/', (req, res) => {
    res.json({ ok: true })
  })

  router.use('/countries', countriesRouter())
  router.use('/objectives', objectivesRouter())
  router.use('/campaigns', campaignsRouter())
  router.use('/generated-campaigns', generatedCampaignsRouter())
  router.use('/meta', metaRouter())
  router.use('/finance', financeRouter())

  return router
}
