// Smart Chat Message Parser
import { ChatFeatureType, FEATURE_PATTERNS, CHAT_FEATURES } from './chat-features';

export interface ParsedMessage {
    featureType: ChatFeatureType | null;
    extracted: Record<string, any>;
    missing: string[];
    needsAiParsing: boolean;
    confidence: number; // 0-1 score of how confident we are in the parsing
    suggestions?: ChatFeatureType[];
}

export interface ParsedFeatureData {
    [key: string]: any;
}

// Main parsing function
export function parseMessage(message: string, conversationHistory: any[] = []): ParsedMessage {
    const cleanMessage = message.trim();

    // 1. Detect feature type
    const featureType = detectFeatureType(cleanMessage);

    if (!featureType || featureType === 'GENERAL') {
        return {
            featureType: 'GENERAL',
            extracted: { message: cleanMessage },
            missing: [],
            needsAiParsing: false,
            confidence: 1.0,
            suggestions: suggestFeaturesFromMessage(cleanMessage)
        };
    }

    // 2. Parse feature-specific data
    const parseResult = parseFeatureData(cleanMessage, featureType, conversationHistory);

    return {
        featureType,
        ...parseResult
    };
}

// Feature type detection
function detectFeatureType(message: string): ChatFeatureType | null {
    // Check for explicit @mentions first
    const explicitMatch = message.match(/@(\w+)/i);
    if (explicitMatch) {
        const mention = explicitMatch[1].toLowerCase();

        // Direct mapping
        const directMappings: Record<string, ChatFeatureType> = {
            'jobinterviewassistant': 'JOBINTERVIEWASSISTANT',
            'interview': 'JOBINTERVIEWASSISTANT',
            'quiz': 'QUIZ',
            'studyplan': 'STUDYPLAN',
            'bughunt': 'BUGHUNT',
            'mockinterview': 'MOCKINTERVIEW'
        };

        if (directMappings[mention]) {
            return directMappings[mention];
        }
    }

    // Pattern-based detection
    for (const [featureType, pattern] of Object.entries(FEATURE_PATTERNS)) {
        if (featureType !== 'GENERAL' && pattern.test(message)) {
            return featureType as ChatFeatureType;
        }
    }

    return 'GENERAL';
}

// Feature-specific data parsing
function parseFeatureData(
    message: string,
    featureType: ChatFeatureType,
    conversationHistory: any[] = []
): Omit<ParsedMessage, 'featureType'> {

    switch (featureType) {
        case 'JOBINTERVIEWASSISTANT':
            return parseJobInterviewData(message, conversationHistory);

        case 'QUIZ':
            return parseQuizData(message, conversationHistory);

        case 'BUGHUNT':
            return parseBugHuntData(message, conversationHistory);

        default:
            return {
                extracted: { message },
                missing: [],
                needsAiParsing: false,
                confidence: 0.5
            };
    }
}

// Job Interview Assistant parser
function parseJobInterviewData(message: string, history: any[]): Omit<ParsedMessage, 'featureType'> {
    const patterns = {
        title: /(?:title|position|job|role)[\s:]+([^,\n]+?)(?:,|$|\.|at|in)/i,
        description: /(?:description|about|duties|responsibilities|role|doing)[\s:]+([^,\n]+?)(?:,|$|\.|company|at)/i,
        company: /(?:company|at|url|website)[\s:]+([^\s,\n]+)/i,
        answers: /(?:answers?|solutions?)[\s:]*(?:yes|true|include|with)/i,
        practice: /(?:practice|mock|simulation)[\s:]*(?:yes|true|include|with)/i,
        technicalCount: /(?:technical|tech)[\s:]*(?:questions?)?[\s:]*(\d+)/i,
        behavioralCount: /(?:behavioral|behaviour|soft)[\s:]*(?:questions?)?[\s:]*(\d+)/i,
        codingCount: /(?:coding|code|programming)[\s:]*(?:questions?)?[\s:]*(\d+)/i
    };

    const extracted: ParsedFeatureData = {};
    let confidence = 0.3; // Base confidence

    // Extract title
    const titleMatch = message.match(patterns.title);
    if (titleMatch) {
        extracted.title = titleMatch[1].trim();
        confidence += 0.3;
    } else {
        // Try to infer from common job titles
        const jobTitlePatterns = [
            /(?:software|frontend|backend|full.?stack|data|devops|mobile)[\s\-]*(?:engineer|developer|scientist|analyst)/i,
            /(?:product|project)[\s\-]*manager/i,
            /(?:ui|ux)[\s\-]*designer/i
        ];

        for (const pattern of jobTitlePatterns) {
            const match = message.match(pattern);
            if (match) {
                extracted.title = match[0];
                confidence += 0.2;
                break;
            }
        }
    }

    // Extract description
    const descMatch = message.match(patterns.description);
    if (descMatch) {
        extracted.description = descMatch[1].trim();
        confidence += 0.3;
    } else if (message.length > 50 && !extracted.title) {
        // If message is long and no explicit fields, might need AI parsing
        confidence -= 0.2;
    }

    // Extract company
    const companyMatch = message.match(patterns.company);
    if (companyMatch) {
        extracted.company = companyMatch[1].trim();
        confidence += 0.1;
    }

    // Extract boolean options
    if (patterns.answers.test(message)) {
        extracted.answers = true;
        confidence += 0.1;
    }

    if (patterns.practice.test(message)) {
        extracted.practice = true;
        confidence += 0.1;
    }

    // Extract question counts
    const techMatch = message.match(patterns.technicalCount);
    if (techMatch) {
        extracted.technicalCount = parseInt(techMatch[1]);
        confidence += 0.1;
    }

    const behavMatch = message.match(patterns.behavioralCount);
    if (behavMatch) {
        extracted.behavioralCount = parseInt(behavMatch[1]);
        confidence += 0.1;
    }

    const codingMatch = message.match(patterns.codingCount);
    if (codingMatch) {
        extracted.codingCount = parseInt(codingMatch[1]);
        confidence += 0.1;
    }

    // Check for context from conversation history
    const contextData = extractContextFromHistory(history, 'JOBINTERVIEWASSISTANT');
    Object.assign(extracted, contextData);

    // Determine missing fields
    const requiredFields = CHAT_FEATURES.JOBINTERVIEWASSISTANT.requiredFields;
    const missing = requiredFields.filter(field => !extracted[field]);

    // Determine if AI parsing is needed
    const needsAiParsing = confidence < 0.6 || missing.length > 0;

    return {
        extracted,
        missing,
        needsAiParsing,
        confidence: Math.min(confidence, 1.0)
    };
}

// Quiz data parser
function parseQuizData(message: string, history: any[]): Omit<ParsedMessage, 'featureType'> {
    const patterns = {
        topic: /(?:topic|subject|about)[\s:]+([^,\n]+?)(?:,|$|\.|difficulty|questions)/i,
        difficulty: /(?:difficulty|level)[\s:]+([^,\n]+?)(?:,|$|\.|questions|type)/i,
        questions: /(?:questions?|items?)[\s:]*(\d+)/i,
        type: /(?:type|format)[\s:]+([^,\n]+?)(?:,|$|\.)/i,
        timeLimit: /(?:time|duration|limit)[\s:]*(\d+)[\s]*(?:min|minutes|sec|seconds)?/i,
        isPublic: /(?:public|private|visibility)[\s:]*([^,\n]+)/i
    };

    const extracted: ParsedFeatureData = {};
    let confidence = 0.3;

    // Extract topic
    const topicMatch = message.match(patterns.topic);
    if (topicMatch) {
        extracted.topic = topicMatch[1].trim();
        confidence += 0.4;
        
        // Map topic to category
        extracted.category = mapTopicToCategory(extracted.topic);
    } else {
        // Try to infer topic from common programming terms
        const topicKeywords = [
            'javascript', 'react', 'node', 'python', 'java', 'typescript',
            'data structures', 'algorithms', 'system design', 'database',
            'html', 'css', 'angular', 'vue', 'sql', 'mongodb'
        ];

        const lowerMessage = message.toLowerCase();
        for (const keyword of topicKeywords) {
            if (lowerMessage.includes(keyword)) {
                extracted.topic = keyword;
                extracted.category = mapTopicToCategory(keyword);
                confidence += 0.2;
                break;
            }
        }
    }

    // Extract difficulty and map to correct enum values
    const diffMatch = message.match(patterns.difficulty);
    if (diffMatch) {
        const diff = diffMatch[1].toLowerCase();
        // Map to correct enum values
        if (['beginner', 'easy', 'basic'].some(d => diff.includes(d))) {
            extracted.difficulty = 'easy';
        } else if (['intermediate', 'medium', 'moderate'].some(d => diff.includes(d))) {
            extracted.difficulty = 'medium';
        } else if (['advanced', 'hard', 'expert', 'difficult'].some(d => diff.includes(d))) {
            extracted.difficulty = 'hard';
        } else {
            // Default mapping
            extracted.difficulty = 'medium';
        }
        confidence += 0.3;
    }

    // Extract question count
    const questionsMatch = message.match(patterns.questions);
    if (questionsMatch) {
        extracted.questions = parseInt(questionsMatch[1]);
        confidence += 0.1;
    }

    // Extract type
    const typeMatch = message.match(patterns.type);
    if (typeMatch) {
        extracted.type = typeMatch[1].trim();
        confidence += 0.1;
    }

    // Extract time limit
    const timeMatch = message.match(patterns.timeLimit);
    if (timeMatch) {
        extracted.timeLimit = parseInt(timeMatch[1]);
        confidence += 0.1;
    }

    // Extract visibility
    const publicMatch = message.match(patterns.isPublic);
    if (publicMatch) {
        const visibility = publicMatch[1].toLowerCase();
        extracted.isPublic = visibility.includes('public');
        confidence += 0.1;
    }

    // Check conversation history
    const contextData = extractContextFromHistory(history, 'QUIZ');
    Object.assign(extracted, contextData);

    // Determine missing fields
    const requiredFields = CHAT_FEATURES.QUIZ.requiredFields;
    const missing = requiredFields.filter(field => !extracted[field]);

    const needsAiParsing = confidence < 0.6 || missing.length > 0;

    return {
        extracted,
        missing,
        needsAiParsing,
        confidence: Math.min(confidence, 1.0)
    };
}

// Helper function to map topics to categories
function mapTopicToCategory(topic: string): string {
    const lowerTopic = topic.toLowerCase();
    
    const categoryMap: Record<string, string> = {
        // Frontend
        'javascript': 'WEB_DEVELOPMENT',
        'react': 'FRONTEND_DEVELOPMENT', 
        'vue': 'FRONTEND_DEVELOPMENT',
        'angular': 'FRONTEND_DEVELOPMENT',
        'html': 'WEB_DEVELOPMENT',
        'css': 'WEB_DEVELOPMENT',
        'frontend': 'FRONTEND_DEVELOPMENT',
        
        // Backend
        'node': 'BACKEND_DEVELOPMENT',
        'nodejs': 'BACKEND_DEVELOPMENT',
        'express': 'BACKEND_DEVELOPMENT',
        'backend': 'BACKEND_DEVELOPMENT',
        'api': 'BACKEND_DEVELOPMENT',
        
        // Languages
        'python': 'SOFTWARE_ENGINEERING',
        'java': 'SOFTWARE_ENGINEERING',
        'typescript': 'WEB_DEVELOPMENT',
        'c++': 'SOFTWARE_ENGINEERING',
        'php': 'BACKEND_DEVELOPMENT',
        
        // Data & Algorithms
        'data structures': 'DATA_STRUCTURES',
        'algorithms': 'ALGORITHMS',
        'dsa': 'DATA_STRUCTURES',
        
        // Databases
        'database': 'DATABASE',
        'sql': 'DATABASE',
        'mongodb': 'DATABASE',
        'mysql': 'DATABASE',
        'postgresql': 'DATABASE',
        
        // System Design
        'system design': 'SYSTEM_DESIGN',
        'architecture': 'SYSTEM_DESIGN',
        'scalability': 'SYSTEM_DESIGN',
        
        // Other
        'machine learning': 'MACHINE_LEARNING',
        'ai': 'MACHINE_LEARNING',
        'devops': 'DEVOPS',
        'security': 'SECURITY',
        'networking': 'NETWORKING',
        'mobile': 'MOBILE_DEVELOPMENT',
        'android': 'MOBILE_DEVELOPMENT',
        'ios': 'MOBILE_DEVELOPMENT',
        'cloud': 'CLOUD_COMPUTING',
        'aws': 'CLOUD_COMPUTING',
        'blockchain': 'BLOCKCHAIN',
        'game': 'GAME_DEVELOPMENT',
        'ui': 'UI_UX_DESIGN',
        'ux': 'UI_UX_DESIGN'
    };

    // Check for exact matches first
    for (const [key, category] of Object.entries(categoryMap)) {
        if (lowerTopic.includes(key)) {
            return category;
        }
    }

    // Default fallback
    return 'WEB_DEVELOPMENT';
}

// BugHunt data parser
function parseBugHuntData(message: string, history: any[]): Omit<ParsedMessage, 'featureType'> {
    const patterns = {
        track: /(?:track|type)[\s:]+([^,\n]+?)(?:,|$|\.|difficulty)/i,
        difficulty: /(?:difficulty|level)[\s:]+([^,\n]+?)(?:,|$|\.|language)/i,
        language: /(?:language|lang)[\s:]+([^,\n]+?)(?:,|$|\.)/i,
        topic: /(?:topic|subject|about)[\s:]+([^,\n]+?)(?:,|$|\.)/i,
        visibility: /(?:visibility|access)[\s:]+([^,\n]+?)(?:,|$|\.)/i
    };

    const extracted: ParsedFeatureData = {};
    let confidence = 0.3;

    // Extract track
    const trackMatch = message.match(patterns.track);
    if (trackMatch) {
        const track = trackMatch[1].toLowerCase();
        if (track.includes('dsa') || track.includes('data structure') || track.includes('algorithm')) {
            extracted.track = 'DSA';
        } else if (track.includes('dev') || track.includes('web') || track.includes('app')) {
            extracted.track = 'DEVELOPMENT';
        } else {
            extracted.track = track.toUpperCase();
        }
        confidence += 0.4;
    }

    // Extract difficulty
    const diffMatch = message.match(patterns.difficulty);
    if (diffMatch) {
        const diff = diffMatch[1].toLowerCase();
        const difficultyMap: Record<string, string> = {
            'rookie': 'ROOKIE',
            'beginner': 'ROOKIE',
            'easy': 'ROOKIE',
            'investigator': 'INVESTIGATOR',
            'intermediate': 'INVESTIGATOR',
            'medium': 'INVESTIGATOR',
            'hunter': 'HUNTER',
            'advanced': 'HUNTER',
            'hard': 'HUNTER',
            'master': 'MASTER',
            'expert': 'MASTER',
            'extreme': 'MASTER'
        };

        for (const [key, value] of Object.entries(difficultyMap)) {
            if (diff.includes(key)) {
                extracted.difficulty = value;
                confidence += 0.4;
                break;
            }
        }
    }

    // Extract other fields
    const langMatch = message.match(patterns.language);
    if (langMatch) {
        extracted.language = langMatch[1].trim();
        confidence += 0.1;
    }

    const topicMatch = message.match(patterns.topic);
    if (topicMatch) {
        extracted.topic = topicMatch[1].trim();
        confidence += 0.1;
    }

    const visibilityMatch = message.match(patterns.visibility);
    if (visibilityMatch) {
        const vis = visibilityMatch[1].toLowerCase();
        extracted.visibility = vis.includes('private') ? 'private' : 'public';
        confidence += 0.1;
    }

    // Check conversation history
    const contextData = extractContextFromHistory(history, 'BUGHUNT');
    Object.assign(extracted, contextData);

    // Determine missing fields
    const requiredFields = CHAT_FEATURES.BUGHUNT.requiredFields;
    const missing = requiredFields.filter(field => !extracted[field]);

    const needsAiParsing = confidence < 0.6 || missing.length > 0;

    return {
        extracted,
        missing,
        needsAiParsing,
        confidence: Math.min(confidence, 1.0)
    };
}

// Extract context from conversation history
function extractContextFromHistory(history: any[], featureType: ChatFeatureType): ParsedFeatureData {
    const contextData: ParsedFeatureData = {};

    // Look for previous messages with the same feature type
    const relevantMessages = history
        .filter(msg => msg.featureType === featureType)
        .slice(-3); // Only look at last 3 relevant messages

    for (const msg of relevantMessages) {
        if (msg.featureData) {
            Object.assign(contextData, msg.featureData);
        }
    }

    return contextData;
}

// Suggest features based on message content
function suggestFeaturesFromMessage(message: string): ChatFeatureType[] {
    const suggestions: ChatFeatureType[] = [];
    const lowerMessage = message.toLowerCase();

    const keywords = {
        JOBINTERVIEWASSISTANT: ['interview', 'job', 'position', 'career', 'hiring', 'questions'],
        QUIZ: ['quiz', 'test', 'assessment', 'questions', 'practice', 'knowledge'],
        BUGHUNT: ['bug', 'debug', 'error', 'fix', 'troubleshoot', 'challenge'],
        STUDYPLAN: ['learn', 'study', 'plan', 'roadmap', 'course', 'skill'],
        MOCKINTERVIEW: ['mock', 'practice interview', 'preparation', 'rehearsal']
    };

    for (const [featureType, keywordList] of Object.entries(keywords)) {
        if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
            suggestions.push(featureType as ChatFeatureType);
        }
    }

    return suggestions.filter(type => CHAT_FEATURES[type].isActive);
}

// Utility function to generate helpful prompts for missing fields
export function generateMissingFieldsPrompt(
    missing: string[],
    extracted: ParsedFeatureData,
    featureType: ChatFeatureType
): string {
    const config = CHAT_FEATURES[featureType];

    if (missing.length === 0) return '';

    let prompt = `I need a bit more information to help you with ${config.name}:\n\n`;

    // Feature-specific prompts
    switch (featureType) {
        case 'JOBINTERVIEWASSISTANT':
            if (missing.includes('title')) {
                prompt += `🎯 **Job Title**: What position are you applying for?\n`;
            }
            if (missing.includes('description')) {
                prompt += `📝 **Job Description**: What will you be doing in this role?\n`;
            }
            break;

        case 'QUIZ':
            if (missing.includes('topic')) {
                prompt += `📚 **Topic**: What subject should the quiz cover?\n`;
            }
            if (missing.includes('difficulty')) {
                prompt += `📊 **Difficulty**: Choose from beginner, intermediate, or advanced\n`;
            }
            break;

        case 'BUGHUNT':
            if (missing.includes('track')) {
                prompt += `🎯 **Track**: Choose DSA (Data Structures & Algorithms) or DEVELOPMENT (Web/App Development)\n`;
            }
            if (missing.includes('difficulty')) {
                prompt += `📊 **Difficulty**: Choose ROOKIE, INVESTIGATOR, HUNTER, or MASTER\n`;
            }
            break;
    }

    // Add example if helpful
    if (config.examples.length > 0) {
        prompt += `\n💡 **Example**: ${config.examples[0]}`;
    }

    return prompt;
}

// Parse AI response for extracted data
export async function parseWithAI(message: string, featureType: ChatFeatureType): Promise<ParsedFeatureData> {
    // This will call Sarvam AI to extract structured data
    // Implementation will be added in the chat action
    return {};
} 