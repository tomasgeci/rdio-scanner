/*
 * *****************************************************************************
 *  Copyright (C) 2019-2020 Chrystian Huot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 * ****************************************************************************
 */

'use strict';

const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

class TrunkRecorderCallUpload {
    constructor(app) {
        return {
            path: '/api/call-upload',

            middleware: (req, res) => upload.fields([
                { name: 'key', maxCount: 1 },
                { name: 'audio', maxCount: 1 },
                { name: 'dateTime', maxCount: 1 },
                { name: 'frequencies', maxCount: 1 },
                { name: 'frequency', maxCount: 1 },
                { name: 'source', maxCount: 1 },
                { name: 'sources', maxCount: 1 },
                { name: 'system', maxCount: 1 },
                { name: 'talkgroup', maxCount: 1 },
            ])(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    res.send(`${err.message}: ${err.field}\n`);

                } else if (err) {
                    res.send(`${err.message}\n`);

                } else {
                    const apiKey = req.body.key;

                    const reqAudio = req.files.audio[0] || {};
                    const reqBody = req.body;

                    const audio = reqAudio.buffer;
                    const audioName = reqAudio.originalname;
                    const audioType = reqAudio.mimetype;

                    const dateTime = new Date(reqBody.dateTime);

                    let frequencies;

                    try {
                        frequencies = JSON.parse(reqBody.frequencies.toString());

                    } catch (_) {
                        frequencies = [];
                    }

                    const frequency = parseInt(reqBody.frequency, 10);

                    const source = parseInt(reqBody.source, 10);

                    let sources;

                    try {
                        sources = JSON.parse(reqBody.sources.toString());

                    } catch (_) {
                        sources = [];
                    }

                    const system = parseInt(reqBody.system, 10);

                    const talkgroup = parseInt(reqBody.talkgroup, 10);

                    if (!app.controller.validateApiKey(apiKey, system, talkgroup)) {
                        const message = `system=${system} talkgroup=${talkgroup} file=${audioName} No matching system/talkgroup`;

                        console.warn(`Api: ${message}`);

                        return res.send(`${message}\n`);
                    }

                    try {
                        await app.controller.importCall({
                            audio,
                            audioName,
                            audioType,
                            dateTime,
                            frequencies,
                            frequency,
                            source,
                            sources,
                            system,
                            talkgroup,
                        });

                        res.send(`Call imported successfully.\n`);

                    } catch (error) {
                        res.send(error.message);
                    }
                }
            }),
        };
    }
}

module.exports = TrunkRecorderCallUpload;
