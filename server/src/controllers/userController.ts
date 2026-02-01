import express from 'express'
import { newClient } from '../../../packages/db/src/index'
import type { authenticatedRequest } from '../interfaces/interface'

export async function websitesOverview(req: authenticatedRequest,res: express.Response) {
  const user_id = req.user_id 
  const total_take = Number(req.body.total_take)
  if (!user_id) {
    return res.status(401).json({
      message: "userid param is not provided",
    });
  }

  try {
    const user = await newClient.user.findUnique({
        where: { id: user_id },
        select: {
            email: true,
            websites: {
                orderBy: { timeadded: "desc" },
                select: {
                    id: true,
                    url: true,
                    timeadded: true,
                    statusticks: {
                        orderBy: { time: "desc" },
                        ...(Number.isInteger(total_take) && total_take > 0
                        ? { take: total_take }
                        : {}),
                        select: {
                            status: true,
                            response_time_ms: true,
                            time: true,
                            region: {
                            select: {
                                id: true,
                                name: true,
                            },
                            },
                        },
                        },
                },
                },
        },
        })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const websites = user.websites.map((website: any) => {
      const regionMap = new Map<string, any>()

      for (const tick of website.statusticks) {
        if (!regionMap.has(tick.region.id)) {
          regionMap.set(tick.region.id, tick)
        }
      }

      return {
        id: website.id,
        url: website.url,
        timeadded: website.timeadded,
        regions: Array.from(regionMap.values()),
      }
    })

    return res.status(200).json({
      email: user.email,
      data: websites,
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch website statuses",
    })
  }
}

export async function loadWebsiteData(req: authenticatedRequest, res: express.Response){
    const user_id = req.user_id 
    const website_id = req.body.websiteid
    if (!user_id || !website_id) return res.status(401).json({
        message: "userid or websiteid param is missing"
    })
    try {
        const regions = await newClient.region.findMany({
            select: {
                id: true,
                name: true,
            },
        })

        const websiteTicks = await Promise.all(
            regions.map(async (region: any) => {
                const ticks = await newClient.websiteTicks.findMany({
                    where: {
                        website_id: website_id,
                        region_id: region.id,
                    },
                    orderBy: {
                        time: "desc",
                    },
                    take: 5,
                    select: {
                        status: true,
                        response_time_ms: true,
                        time: true,
                    },
                });

                return {
                    region_id: region.id,
                    region_name: region.name,
                    ticks,
                }
            })
        )

        return res.status(200).json({
            message: "Fetched successfully",
            data: websiteTicks
        })

    } catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "error while fetching"
        })
    }
}

export async function addNewWebsite(req: authenticatedRequest, res: express.Response){
    const user_id = req.user_id 
    const new_url = req.body.url
    if (!user_id || !new_url) {
        return res.status(401).json({
            message: "userid or url is missing"
        })
    }
    try {
        const exist = await newClient.website.findFirst({
            where: {
                owner_id: user_id,
                url: new_url
            }
        })
        if (exist) return res.status(200).json({
            message: "URL already linked with you"
        })
        const result = await newClient.website.create({
            data: {
                owner_id: user_id,
                url: new_url
            }
        })
        return res.status(200).json({
            message: "URL added successfully",
            data: result
        })
    } catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Error while adding website"
        })
    }
}

export async function removeWebsite(req: authenticatedRequest, res: express.Response){
    const user_id = req.user_id 
    const delete_url = req.body.url as string
    if (!user_id || !delete_url) {
        return res.status(401).json({
            message: "userid or url is missing"
        })
    }
    try {
        const exist = await newClient.website.findFirst({
            select: {
                id: true
            },
            where: {
                url: delete_url,
                owner_id: user_id
            }
        })
        if (!exist) return res.status(200).json({
            message: "No such URL linked with given user"
        })
        await newClient.website.delete({
            where: {
                id: exist.id
            }
        })
        
        return res.status(200).json({
            message: "URL deleted successfully"
        })
    } catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Error while adding website"
        })
    }
}