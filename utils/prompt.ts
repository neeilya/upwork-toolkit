import { storage } from '#imports'

const namespace = 'sync:__COVER_LETTER_PROMPT'

export enum PromptVariable {
  TITLE = '#{title}',
  JOB_DESCRIPTION = '#{job_description}',
}

const get = () =>
  storage.getItem<string>(namespace, { fallback: defaultPrompt })

const save = async (value: string) => {
  await storage.setItem<string>(namespace, value)
  return value
}

const defaultPrompt = `Create a cover letter for this job which has title:
#{title}

and job description:
#{job_description}

Mention my experience with relevant technologies.
Use less than 300 words.

Do not start with "Dear Hiring manager" or anything similar.`

export default { get, save, defaultPrompt }
