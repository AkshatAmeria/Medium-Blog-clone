import { Hono } from "hono";
import {verify,sign,decode} from "hono/jwt"
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { signinInput, signupInput, createPostInput, updatePostInput } from "@akshat1201/medium-common-2"

export const blogRouter = new Hono<{
    Bindings:{
        JWT_SECRET:string;
        DATABASE_URL:string
    },
    Variables:{
    userId:string
}
}>();


blogRouter.use("/*",async(c,next) =>{
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader,c.env.JWT_SECRET);
        if(user){
            //@ts-ignore
            c.set("userId",user.id);
           await next();
        } else{
            c.status(403)
            return c.json({
                message:"You are not logged inn"
            })
        }

    } catch (error) {
        c.status(403)
        return c.json({
            message:"You are not logged inn"
        })
    }
   
})


blogRouter.post('/', async(c) => {
    const body = await c.req.json();
const userId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
      const { success } = createPostInput.safeParse(body);
      if(!success){
        c.status(400);
        return c.json({error:"Invalid inputs"})
      }
const post = await prisma.post.create({
    data:{
        title:body.title,
        content:body.content,
        authorId:(userId)
    }
})

	return c.json({
        id:post.id
    })
})




blogRouter.put('/', async(c) => {

    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
    
      const { success } = updatePostInput.safeParse(body);
      if (!success) {
          c.status(400);
          return c.json({ error: "invalid input" });
      }
const post = await prisma.post.update({
    where:{
        id:body.id,
    },
    data:{
        title:body.title,
        content:body.content
    }
})

	return c.json({
        id:post.id
    })



})



blogRouter.get('/bulk', async(c) => {
	
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const posts = await prisma.post.findMany();

      return c.json({
        posts
      })


})


blogRouter.get('/:id', async(c) => {

const id = await c.req.param("id");
const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const post = await prisma.post.findFirst({
        where:{
            id:id
        }
    })

    return c.json({
        post
    })

  } catch (error) {
    c.status(411)
    return c.json("Unavailable at this moment")
  }


})

//back//
// https://medium.120104-akshat.workers.dev //
