{
  "rule_name": "Mermaid图规则",
  "description": "关于Mermaid图表使用的特殊规则",
  "priority": "高",
  "basic_principle": "[]、() 不允许嵌套使用",
  "forbidden_nested_patterns": [
    "[[]] - 方括号嵌套",
    "[()] - 方括号内嵌套圆括号",
    "(()) - 圆括号嵌套",
    "([]) - 圆括号内嵌套方括号",
    "(1[]1) - 圆括号内嵌套带内容的方括号"
  ],
  "correct_usage": {
    "description": "使用单层括号，避免任何形式的括号嵌套",
    "patterns": [
      "使用单层括号：[内容] 或 (内容)",
      "避免任何形式的括号嵌套",
      "如需表示复杂结构，考虑使用其他Mermaid图表类型或调整表达方式"
    ]
  },
  "examples": {
    "correct": "graph TD\n  A[开始] --> B[处理]\n  B --> C[结束]",
    "incorrect": "graph TD\n  A[[开始]] --> B[处理]\n  B --> C([结束])"
  }
}