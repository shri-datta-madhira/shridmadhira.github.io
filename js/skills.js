/* ============================================================
   skills.js — category tabs + animated chip cloud + marquee
   Skills marked with a trailing * are familiar / exposure-level.
   ============================================================ */

const CATEGORIES = [
  { name: 'Programming Languages', skills: ['Java (8–21)', 'Python', 'JavaScript', 'TypeScript', 'Groovy', 'Shell Scripting', 'Go*', 'C++*'] },
  { name: 'Web & APIs', skills: ['Node.js', 'React.js', 'REST', 'GraphQL', 'gRPC', 'HTML/CSS', 'Redux', 'Protobuf*', 'Thrift*'] },
  { name: 'AWS', skills: ['Lambda', 'ECS / ECR', 'S3', 'RDS', 'SQS', 'VPC', 'API Gateway', 'Secrets Manager', 'CodeArtifact', 'DynamoDB*', 'Kinesis*'] },
  { name: 'DevOps & CI/CD', skills: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD', 'Git', 'LaunchDarkly', 'Azure', 'GCP'] },
  { name: 'Observability', skills: ['Prometheus', 'Splunk', 'Grafana*', 'OpenTelemetry*', 'Datadog*'] },
  { name: 'Databases', skills: ['PostgreSQL', 'IBM DB2', 'Oracle (PL/SQL)', 'MongoDB', 'SQL Server', 'Snowflake', 'Cassandra*', 'Redis*', 'Elasticsearch*'] },
  { name: 'Java Frameworks', skills: ['Spring Boot', 'Hibernate', 'JPA', 'Gradle', 'Maven', 'MapStruct', 'Liquibase', 'HashiCorp Vault'] },
  { name: 'Testing & AI/ML', skills: ['Mockito', 'JUnit', 'Cucumber', 'GitHub Copilot', 'PyTorch', 'TensorFlow'] },
  { name: 'Messaging', skills: ['Apache Kafka', 'ActiveMQ', 'RabbitMQ', 'Apache Flink*'] },
  { name: 'Architecture & Methodologies', skills: ['Microservices', 'Event-Driven', 'Distributed Systems', 'TDD', 'Agile/Scrum', 'IaC', 'SLI/SLO', 'SRE*', 'FinOps*', 'OOP', 'SDLC'] },
];

const MARQUEE = [
  'Java', 'Apache Kafka', 'AWS', 'Spring Boot', 'Terraform', 'Docker', 'Kubernetes',
  'Python', 'Microservices', 'Event-Driven', 'PostgreSQL', 'CI/CD', 'Distributed Systems',
];

export function initSkills() {
  const catsEl = document.getElementById('skill-cats');
  const cloudEl = document.getElementById('skill-cloud');
  const titleEl = document.getElementById('skill-cloud-title');
  if (!catsEl || !cloudEl) return;

  function renderCloud(idx) {
    const cat = CATEGORIES[idx];
    titleEl.textContent = cat.name;
    cloudEl.innerHTML = '';
    cat.skills.forEach((skill, i) => {
      const chip = document.createElement('span');
      const familiar = skill.endsWith('*');
      chip.className = 'skill-chip' + (familiar ? ' familiar' : '');
      chip.textContent = skill;
      chip.style.setProperty('--cd', `${i * 45}ms`);
      cloudEl.appendChild(chip);
    });
  }

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'skill-cat' + (i === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.innerHTML = `<span>${cat.name}</span><span class="count">${cat.skills.length}</span>`;
    btn.addEventListener('click', () => {
      catsEl.querySelectorAll('.skill-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCloud(i);
    });
    catsEl.appendChild(btn);
  });

  renderCloud(0);

  // Marquee — duplicate the list so the 50% translate loops seamlessly
  const lane = document.getElementById('skill-marquee-lane');
  if (lane) {
    [...MARQUEE, ...MARQUEE].forEach(name => {
      const s = document.createElement('span');
      s.textContent = name;
      lane.appendChild(s);
    });
  }
}
