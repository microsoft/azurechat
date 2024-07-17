interface SessionData {
    name: string;
    email: string;
    id: string;
    image: string;
    isAdmin: boolean;
}
  
const sessions: { [key: string]: SessionData } = {};
  
export const createSession = (sessionId: string, data: SessionData): void => {
    sessions[sessionId] = data;
};
  
export const getSession = (sessionId: string): SessionData | null => {
    return sessions[sessionId] || null;
};

export const deleteSession = (sessionId: string): void => {
    delete sessions[sessionId];
};