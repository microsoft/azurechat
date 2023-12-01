#!/bin/bash
cd src
npx prisma migrate dev
npm run dev
