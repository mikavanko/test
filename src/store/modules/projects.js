
import { getProjects, getProjectUsers, regenerateLink } from "@/api/projects"
import ProjectAdapter from "@/adapters/Project"
import UserAdapter from "@/adapters/User"
import { map } from "lodash"

export default {
  namespaced: true,
  state: {
    newProject: JSON.parse(localStorage.getItem("newProject")) || null,
    currentProject: localStorage.getItem("currentProject") && JSON.parse(localStorage.getItem("currentProject")) || null,
    projects: JSON.parse(localStorage.getItem("projects")) || null,
    users: [],
  },
  mutations: {
    setProjects(state, val) {
      localStorage.setItem("projects", val && JSON.stringify(val));
      state.projects = val
    },
    setCurrentProject(state, project) {
      localStorage.setItem(
        "currentProject",
        project && JSON.stringify(project)
      );
      state.currentProject = project
    },
    setNewProject(state, project) {
      localStorage.setItem("newProject", project && JSON.stringify(project));
      state.newProject = project
    },
    setProjectUsers(state, val) {
      state.users = val
    },
  },
  actions: {
    async getProjects({ commit, state }, params) {
      const {
        data: { data: projectsRaw },
      } = await getProjects(params);

      const projects = map(projectsRaw, ProjectAdapter);

      const oldProjects = state.projects

      if (oldProjects) {
        const diff = getDifference(projects, oldProjects);
        const oldMatches = getMatches(oldProjects, projects);
        const newMatches = oldMatches.map(m => {
          return projects.find(p => p.id === m.id)
        });

        commit("setProjects", [...newMatches, ...diff]);
        
      } else {
        commit("setProjects", projects);
      }

      return projects;
    },
    setCurrentProject({ commit, state }, project) {
      if(state.projects){
        const projects = [...state.projects]
        const idx = projects.findIndex(item => item.id === project.id)
        projects.splice(idx, 1)
        projects.unshift(project)
        commit("setProjects", projects);
      }
      
      if(project) {
        commit("setCurrentProject", project);
      }
    },
    setNewProject({ commit }, project) {
      const p = ProjectAdapter(project);
      commit("setNewProject", p);
    },
    async getProjectUsers({ commit }, { id, params }) {
      const {
        data: { data: usersRaw },
      } = await getProjectUsers(id, params);

      const users = map(usersRaw, UserAdapter)

      commit("setProjectUsers", users);

      return users
    },
    async regenerateLink({commit}, projectId) {
      const {
        data: { data: projectRaw },
      } = await regenerateLink(projectId);

      const project = ProjectAdapter(projectRaw);

      commit("setCurrentProject", project);

      return project;
    }, 
  },
  getters: {
    getCurrentProject: (state) => state.currentProject,
    getNewProject: (state) => state.newProject,
    getProjects: (state) => state.projects,
    getUsers: (state) => state.users,
  },
};

function getDifference(array1, array2) {
  return array1.filter(object1 => {
    return !array2.some(object2 => {
      return object1.id === object2.id;
    });
  });
}
function getMatches(array1, array2) {
  return array1.filter(object1 => {
    return array2.some(object2 => {
      return object1.id === object2.id;
    });
  });
}
