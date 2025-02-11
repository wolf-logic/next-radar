export const ExceptionMessages = {
    TOO_MANY_QUADRANTS: "There are more than 4 quadrant names listed in your data. Check the quadrant column for errors.",
    MISSING_HEADERS:
        "Document is missing one or more required headers or they are misspelled. " +
        "Check that your document contains headers for \"name\", \"ring\", \"quadrant\", \"status\", \"description\".",
    MISSING_CONTENT: "Document is missing content.",
    LESS_THAN_FOUR_QUADRANTS:
        "There are less than 4 quadrant names listed in your data. Check the quadrant column for errors.",
};

export default ExceptionMessages;
