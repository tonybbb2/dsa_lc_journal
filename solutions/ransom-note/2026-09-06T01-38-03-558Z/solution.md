```java
class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {
        char[] chars = ransomNote.toCharArray();
        char[] charMag = magazine.toCharArray();

        Arrays.sort(chars);
        Arrays.sort(charMag);

                String sorted1 = new String(chars);
                        String sorted2 = new String(charMag);

        if (sorted2.contains(sorted1)) {
            return true;
        } else {
            return false;
        }
    }
}
```
