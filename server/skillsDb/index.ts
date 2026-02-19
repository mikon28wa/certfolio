// Re-export all functions for backward compatibility with `import * as skillsDb from "./skillsDb"`
export { getCourseByUuid, createCourse, incrementCourseUsage, getAllCourses } from "./courseLibraryDb";
export { getSkillMappingsByCourseLibraryId, getSkillMappingsByCertificateId, createSkillMapping, createSkillMappings, deleteSkillMappingsByCertificateId } from "./skillMappingsDb";
export { createProjectEvent, getProjectEventsByUserId, getProjectEventById, updateProjectEvent, deleteProjectEvent } from "./projectEventsDb";
export { createProjectSkillLinks, getProjectSkillLinks, deleteProjectSkillLinks, addProjectMedia, getProjectMedia, deleteProjectMedia } from "./projectLinksDb";
export { getUserSkills, getUserSkillByName, upsertUserSkill } from "./userSkillsDb";
export { recalculateUserSkills, getSkillDetails, getCollectionSkills, captureSkillSnapshot, getSkillTimeline, compareSkills, getSkillRecommendations } from "./skillAggregation";
