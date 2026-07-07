```java
class Solution {
    public int bagOfTokensScore(int[] tokens, int power) {
        Arrays.sort(tokens);

        int score = 0;
        int maxScore = 0;
        int indexEnd = tokens.length -1;

        for (int i=0; i<tokens.length;i++) {
            if (i > indexEnd) {
                break;
            }

            if (power >= tokens[i]) {
                power = power - tokens[i];
                score++;
                maxScore = Math.max(score, maxScore);
            } else if (score > 0 && i < indexEnd) {
                power = power + tokens[indexEnd];
                score--;
                indexEnd--;
                i--;
            } else {
                break;
            }
            
        }

        return maxScore;
    }
}
```
