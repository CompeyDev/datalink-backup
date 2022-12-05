// $$$$$$$\             $$\               $$\ $$\           $$\       
// $$  __$$\            $$ |              $$ |\__|          $$ |      
// $$ |  $$ | $$$$$$\ $$$$$$\    $$$$$$\  $$ |$$\ $$$$$$$\  $$ |  $$\ 
// $$ |  $$ | \____$$\\_$$  _|   \____$$\ $$ |$$ |$$  __$$\ $$ | $$  |
// $$ |  $$ | $$$$$$$ | $$ |     $$$$$$$ |$$ |$$ |$$ |  $$ |$$$$$$  / 
// $$ |  $$ |$$  __$$ | $$ |$$\ $$  __$$ |$$ |$$ |$$ |  $$ |$$  _$$<  
// $$$$$$$  |\$$$$$$$ | \$$$$  |\$$$$$$$ |$$ |$$ |$$ |  $$ |$$ | \$$\ 
// \_______/  \_______|  \____/  \_______|\__|\__|\__|  \__|\__|  \__|     

// Copyright (c) 2022 Datalink Contributors. All rights reserved.  

// This source code is licensed under the MIT license.
// See LICENSE file in the project root for more details.
// Original licensing can be found in LICENSE in the root 
// directory of this source tree.

import type { NextApiRequest, NextApiResponse } from 'next'
import fetchtoken from '../../lib/fetchToken'
import { v4 as uuidv4 } from 'uuid';
import validateToken from '../../lib/validateSession'
import prisma from '../../lib/prisma'
import { Data, Heartbeat, Res } from '../../lib/types/types'
import { withSentry } from '@sentry/nextjs';
import { validateAuthTypes } from '../../lib/validateTypeZ';
import { isObject } from 'lodash';


const handler = async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Heartbeat | Res>
) {
    const query = req.body;
    const { id, token } = query;

    if (token && id && validateAuthTypes(id, token)) {
        const validation = await validateToken(id as number, token as string)
        if (validation == undefined) {
            console.log(validation); res.status(502).json({ code: 502, status: `Internal Server Error` })
            return;
        }
        if (validation === true) {
            res.status(200).json({ code: 200, status: `Session Key OK` })
            return;
        } else if (validation === false) {
            res.status(401).json({ code: 401, status: `Session Key Invalid` })
            return;
        }

        if (isObject(validateToken)) {
            const validation = (validateToken as unknown as { state: boolean, expiringSoon: boolean })

            if (validation.state === true) {
                res.status(200).json({ code: 200, status: `Session Key OK`, expiringSoon: validation.expiringSoon })
                return;
            }

        }
    } else {
        res.status(400).json({ code: 400, status: 'Bad Request' })
        return;
    }
}

export default withSentry(handler)